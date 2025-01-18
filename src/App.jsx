import React, { useState, useEffect } from 'react';
import { ref, onValue, update, set, get } from 'firebase/database';
import database from '../firebase';
import NewsTicker from './NewsTicker';
import './index.css';

const clubsAndBars = [
  'The Owl San Diego',
  'Mavericks Beach Club',
  'Nova SD',
  'PB Shore Club',
  'Parq',
  'The Duck Dive',
  'Side Bar',
  'Phantom Lounge and Nightclub',
  'The Casbah',
  'The Rail',
  'Oxford Social Club',
  'The Tipsy Crow',
  'Onyx',
  'F6ix',
  'Bloom',
  'Omertà',
  'Sevilla',
  'Mr Tempo',
  'TORO',
  'FLUXX',
  'Prohibition Lounge',
  'Spin',
  'Moonshine Flats',
  '710 Beach Club',
  'Lahaina Beach House',
  'PB Avenue',
  'Moonshine Beach',
  'Thrusters Lounge',
  'The Local',
  'Open Bar',
  'Tavern at the Beach',
  'The Silver Fox Lounge',
  'The Collective',
  'Firehouse',
  'Hideaway',
];

const newsItems = [
  'Nova SD: DJ Snake performing this Friday!',
  'Mavericks Beach Club: Voted #1 for daytime vibes!',
  'Most Underrated: The Duck Dive (check it out!)',
  'Newest Venue Added: The Collective',
  'Longest Top Rated Streak: Firehouse',
  'New Happy Hour Deal @ Hideaway',
];

const getRatingColorClass = (rating) => {
  if (rating >= 7) return 'text-green-500';
  if (rating < 5) return 'text-red-500';
  return 'text-gray-200';
};

const getFireOpacity = (rating) => {
  if (!rating) return 0;
  return Math.min(1, rating / 10);
};

const App = () => {
  const [ratings, setRatings] = useState({});
  const [ratedLocations, setRatedLocations] = useState(new Set());

  const [currentClubForComments, setCurrentClubForComments] = useState(null);
  const [commentsByClub, setCommentsByClub] = useState(
    clubsAndBars.reduce((acc, club) => {
      acc[club] = [];
      return acc;
    }, {})
  );
  const [newComment, setNewComment] = useState('');

  // Submission Popup
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [submissionEmail, setSubmissionEmail] = useState('');
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [previousNightTop, setPreviousNightTop] = useState(null);

  // 3) For Search
  const [searchTerm, setSearchTerm] = useState('');

  // 4) For Check-ins (Live Crowd Tracking)
  const [checkInCounts, setCheckInCounts] = useState({});
  const [checkedInLocations, setCheckedInLocations] = useState(new Set());

  // ========== FIREBASE LOADING ==========

  // Load RATINGS from Firebase
  useEffect(() => {
    const ratingsRef = ref(database, 'ratings');
    onValue(ratingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRatings(data);
      }
    });
  }, []);

  // Load CHECK-INS from Firebase
  useEffect(() => {
    const checkInsRef = ref(database, 'checkIns');
    onValue(checkInsRef, (snapshot) => {
      const data = snapshot.val() || {};
      setCheckInCounts(data);
    });
  }, []);

  // Daily RESET
  useEffect(() => {
    const now = new Date();
    let resetTime = new Date();
    resetTime.setHours(6, 0, 0, 0);
  
    if (resetTime.getTime() <= now.getTime()) {
      resetTime.setDate(resetTime.getDate() + 1);
    }
  
    const timeout = setTimeout(async () => {
      const ratingsSnap = await get(ref(database, 'ratings'));
      const ratingsData = ratingsSnap.val();
  
      if (ratingsData) {
        let topClub = null;
        let topAverage = -Infinity;
        Object.keys(ratingsData).forEach((clubName) => {
          const { total, count } = ratingsData[clubName];
          if (count > 0) {
            const avg = total / count;
            if (avg > topAverage) {
              topAverage = avg;
              topClub = clubName;
            }
          }
        });
  
        if (topClub) {
          const topRatingRef = ref(database, 'topRating');
          set(topRatingRef, {
            club: topClub,
            average: topAverage,
            timestamp: Date.now(),
          });
        }
      }
  
      set(ref(database, 'comments'), null);
      set(ref(database, 'ratings'), null);
      set(ref(database, 'checkIns'), null);
    }, resetTime.getTime() - now.getTime());
  
    return () => clearTimeout(timeout);
  }, []);  

  // Top Rating from Previous Night
  useEffect(() => {
    const topRatingRef = ref(database, 'topRating');
    onValue(topRatingRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPreviousNightTop(data);
      } else {
        setPreviousNightTop(null);
      }
    });
  }, []);

  // Load comments ON DEMAND
  useEffect(() => {
    if (!currentClubForComments) return;
    const clubCommentsRef = ref(database, `comments/${currentClubForComments}`);
    const unsubscribe = onValue(clubCommentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const clubComments = Object.values(data).sort((a, b) => b.timestamp - a.timestamp);
        setCommentsByClub((prev) => ({
          ...prev,
          [currentClubForComments]: clubComments,
        }));
      } else {
        setCommentsByClub((prev) => ({
          ...prev,
          [currentClubForComments]: [],
        }));
      }
    });
    return () => unsubscribe();
  }, [currentClubForComments]);

  // ========== HELPER RENDERING ==========

  const renderAverage = (club) => {
    const clubRatings = ratings[club];
    if (!clubRatings || clubRatings.count === 0) {
      return <span className="text-gray-400">No ratings yet</span>;
    }
    const average = clubRatings.total / clubRatings.count;
    const colorClass = getRatingColorClass(average);
    return <span className={colorClass}>{average.toFixed(1)}</span>;
  };

  // ========== HANDLERS ==========

  // ADD COMMENT (PER CLUB)
  const handleAddComment = () => {
    if (!newComment.trim() || !currentClubForComments) return;
    const uniqueKey = Date.now();
    const clubCommentsRef = ref(database, `comments/${currentClubForComments}/${uniqueKey}`);
    const commentData = {
      text: newComment,
      timestamp: uniqueKey,
    };
    update(clubCommentsRef, commentData);
    setNewComment('');
  };

  // ADD RATING
  const handleRatingChange = (club, newRating) => {
    if (ratedLocations.has(club)) {
      alert('You have already rated this location.');
      return;
    }
    const clubRef = ref(database, `ratings/${club}`);
    const currentRating = ratings[club] || { total: 0, count: 0 };
    update(clubRef, {
      total: currentRating.total + newRating,
      count: currentRating.count + 1,
    });
    setRatedLocations((prev) => new Set(prev).add(club));
  };

  // SUBMISSION FOR NEW CLUB/BAR
  const handleSubmitClubSubmission = () => {
    if (!submissionEmail.trim() || !submissionMessage.trim()) return;

    const uniqueKey = Date.now();
    const submissionRef = ref(database, `clubSubmissions/${uniqueKey}`);
    const submissionData = {
      email: submissionEmail,
      message: submissionMessage,
      timestamp: uniqueKey,
    };

    update(submissionRef, submissionData);
    setSubmissionEmail('');
    setSubmissionMessage('');
    setShowSubmissionForm(false);
  };

  // CHECK-IN / CROWD TRACKING
  const handleCheckIn = (club) => {
    // 1. Check if this club has already been checked in
    if (checkedInLocations.has(club)) {
      alert('You have already checked in at this location.');
      return;
    }
  
    // 2. If not, proceed with incrementing the check-in count in Firebase
    const currentCount = checkInCounts[club]?.count || 0;
    update(ref(database, `checkIns/${club}`), { count: currentCount + 1 })
      .then(() => {
        console.log(`Check-in successful for ${club}`);
        // 3. Mark this club as checked in for the current session
        setCheckedInLocations((prev) => new Set(prev).add(club));
      })
      .catch((err) => console.error('Check-in failed:', err));
  };  

  // ========== SORTING & SEARCH FILTERING ==========

  // Sort clubs by average rating (descending)
  const sortedClubs = [...clubsAndBars].sort((a, b) => {
    const clubARatings = ratings[a];
    const clubBRatings = ratings[b];

    const avgA =
      clubARatings && clubARatings.count > 0
        ? clubARatings.total / clubARatings.count
        : 0;
    const avgB =
      clubBRatings && clubBRatings.count > 0
        ? clubBRatings.total / clubBRatings.count
        : 0;

    return avgB - avgA; // highest first
  });

  // Filter by search term
  const filteredClubs = sortedClubs.filter((club) =>
    club.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ========== RENDER ==========

  return (
    <div className="min-h-screen w-screen flex flex-col items-center bg-black pt-0 p-4">
      {/* News Ticker at Top */}
      <NewsTicker items={newsItems} />

      <h1 className="text-5xl font-bold text-neon-purple mb-6 text-center">
        CLUB HOPPR
      </h1>
      <h2 className="text-1xl font-bold text-neon-purple mb-6 text-center">
        Give YOUR Rating of the Hottest Spots in Downtown SD & PB!
      </h2>

      {previousNightTop && (
        <div className="mb-6 p-4 bg-gray-900 rounded-lg shadow-lg text-center">
          <h2 className="text-md font-bold text-neon-purple mb-2 text-center">
            ⭐️ Top Rated from the Previous Night ⭐️
          </h2>
          <h3 className="text-white font-bold text-3xl mt-2 mb-1 text-center">
            {previousNightTop.club}
          </h3>
          <p className="text-yellow-400">
            Average Rating: {previousNightTop.average.toFixed(1)}
          </p>
        </div>
      )}

      {/* SEARCH BAR */}
      <div className="w-full max-w-md mb-6">
        <input
          type="text"
          className="w-full p-2 rounded bg-gray-800 text-white"
          placeholder="Search for a club..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* LIST OF CLUBS */}
      <div className="w-screen max-w-2xl bg-gray-900 shadow-lg rounded-lg p-4 sm:p-6 md:p-8">
        {filteredClubs.map((club) => {
          const clubRatings = ratings[club];
          let averageNumeric = null;
          if (clubRatings && clubRatings.count > 0) {
            averageNumeric = clubRatings.total / clubRatings.count;
          }
          const fireOpacity = averageNumeric ? getFireOpacity(averageNumeric) : 0;
          const crowdCount = checkInCounts[club] || 0;

          return (
            <div key={club} className="border-b border-neon-purple py-4">
              <button
                className="float-right px-4 py-2 text-sm sm:text-base sm:px-6 sm:py-3 bg-neon-purple text-black rounded hover:bg-purple-800 disabled:opacity-50"
                onClick={() => setCurrentClubForComments(club)}
              >
                View Comments
              </button>

              <h2 className="text-2xl font-semibold text-white mb-2">
                {club}
                {averageNumeric && (
                  <span
                    style={{ marginLeft: '0.5rem', opacity: fireOpacity }}
                    aria-label="Fire Emoji"
                  >
                    🔥
                  </span>
                )}
              </h2>

              {/* AVERAGE RATING */}
              <p className="text-gray-400 mb-2">
                Average Rating: {renderAverage(club)}
              </p>

              {/* RATING BUTTONS */}
              <div className="flex flex-wrap space-x-1 mb-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleRatingChange(club, rating)}
                    className="px-2 py-0.5 bg-neon-purple text-black rounded hover:bg-purple-800 disabled:opacity-50"
                    disabled={ratedLocations.has(club)}
                  >
                    {rating}
                  </button>
                ))}
              </div>

              {/* CHECK-IN CROWD TRACKING */}
              <div className="flex items-center space-x-4 mb-2">
                <button
                  onClick={() => handleCheckIn(club)}
                  className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700 text-white"
                >
                  Check In
                </button>
                <p className="text-white">
                  Crowd Meter: <span className="text-yellow-400 font-bold">{checkInCounts[club]?.count || 0}</span> people
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER */}
      <footer className="mt-6 text-gray-400 text-sm text-center">
        Ratings, Comments, & Check-Ins reset daily at 6:00 AM PST
      </footer>

      {/* Request a Bar/Club to be Added */}
      <button
        className="mt-4 bg-neon-purple px-4 py-2 rounded hover:bg-purple-800 text-black"
        onClick={() => setShowSubmissionForm(true)}
      >
        Request a Bar/Club to be Added
      </button>

      {/* COMMENTS SIDEBAR */}
      {currentClubForComments && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
          <div className="bg-gray-900 text-white w-80 h-full shadow-lg overflow-y-auto p-4 relative">
            <button
              className="float-right top-4 right-4 text-gray-400 hover:text-gray-200"
              onClick={() => setCurrentClubForComments(null)}
            >
              Close
            </button>
            <h2 className="text-2xl font-bold mb-4">{currentClubForComments}</h2>
            <div className="mt-4">
              <textarea
                className="w-full bg-gray-800 text-white rounded p-2"
                rows="3"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
              />
              <button
                className="mt-2 bg-neon-purple px-4 py-2 rounded hover:bg-purple-800"
                onClick={handleAddComment}
              >
                Submit
              </button>
            </div>
            <div className="flex flex-col space-y-4 mt-4">
              {commentsByClub[currentClubForComments].map((comment, idx) => (
                <div key={idx} className="border-b border-gray-700 pb-2">
                  <p>{comment.text}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(comment.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Club Submission Popover */}
      {showSubmissionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-900 text-white w-80 rounded-lg shadow-lg p-4 relative">
            <button
              className="float-right top-2 right-2 text-gray-400 hover:text-gray-200"
              onClick={() => setShowSubmissionForm(false)}
            >
              Close
            </button>
            <h2 className="text-2xl font-bold mb-4">Request a New Club/Bar</h2>

            <label className="block mb-2 text-sm font-medium">Your Email:</label>
            <input
              type="email"
              value={submissionEmail}
              onChange={(e) => setSubmissionEmail(e.target.value)}
              className="w-full mb-4 p-2 rounded bg-gray-800 text-white"
              placeholder="email@example.com"
            />

            <label className="block mb-2 text-sm font-medium">
              Club/Bar Name &amp; Message:
            </label>
            <textarea
              value={submissionMessage}
              onChange={(e) => setSubmissionMessage(e.target.value)}
              rows={3}
              className="w-full mb-4 p-2 rounded bg-gray-800 text-white"
              placeholder="Tell us which club/bar you want added..."
            />

            <button
              onClick={handleSubmitClubSubmission}
              className="bg-neon-purple px-4 py-2 rounded hover:bg-purple-800 text-black"
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;