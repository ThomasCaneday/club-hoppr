import React, { useState, useEffect } from 'react';
import { ref, onValue, update, set } from 'firebase/database';
import database from '../firebase';
import './index.css';

const clubsAndBars = [
  'The Owl San Diego',
  'Mavericks Beach Club',
  'Nova SD',
  'PB Shore Club',
  'Parq Nightclub',
  'The Duck Dive',
];

const getRatingColorClass = (rating) => {
  if (rating >= 7) return 'text-green-500';
  if (rating < 5) return 'text-red-500';
  return 'text-gray-200';
};

const getFireOpacity = (rating) => {
  if (!rating) return 0;
  // rating 0..10 -> opacity 0..1
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

  // Daily RESET
  useEffect(() => {
    const now = new Date();
    const resetTime = new Date();
    resetTime.setHours(6, 0, 0, 0);
    if (now > resetTime) resetTime.setDate(resetTime.getDate() + 1);

    const timeout = setTimeout(() => {
      // Clear comments
      clubsAndBars.forEach((club) => {
        set(ref(database, `comments/${club}`), null);
      });
      // Clear ratings
      set(ref(database, 'ratings'), null);
    }, resetTime - now);

    return () => clearTimeout(timeout);
  }, []);

  // Load comments ON DEMAND for currentClubForComments
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

  // RENDER AVERAGE
  const renderAverage = (club) => {
    const clubRatings = ratings[club];
    if (!clubRatings || clubRatings.count === 0) {
      return <span className="text-gray-400">No ratings yet</span>;
    }
    const average = clubRatings.total / clubRatings.count;
    const colorClass = getRatingColorClass(average);
    return <span className={colorClass}>{average.toFixed(1)}</span>;
  };

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

  return (
    <div className="min-h-screen w-screen flex flex-col items-center bg-black p-4 sm:p-6 lg:p-8">
      <h1 className="text-4xl font-bold text-neon-purple mb-6 text-center">
        NIGHTLINE
      </h1>
      <h2 className="text-1xl font-bold text-neon-purple mb-6 text-center">
        Give YOUR Rating of the Hottest Spots in Downtown SD & PB!
      </h2>

      <div className="w-screen max-w-2xl bg-gray-900 shadow-lg rounded-lg p-4 sm:p-6 md:p-8">
        {clubsAndBars.map((club) => {
          // Compute numeric average so we can control the fire emoji's opacity
          const clubRatings = ratings[club];
          let averageNumeric = null;
          if (clubRatings && clubRatings.count > 0) {
            averageNumeric = clubRatings.total / clubRatings.count;
          }
          const fireOpacity = averageNumeric ? getFireOpacity(averageNumeric) : 0;

          return (
            <div key={club} className="border-b border-neon-purple py-4">
              <button
                className="float-right px-4 py-2 text-sm sm:text-base sm:px-6 sm:py-3 bg-neon-purple text-black rounded hover:bg-purple-800 disabled:opacity-50"
                onClick={() => setCurrentClubForComments(club)}
              >
                View Comments
              </button>

              {/* CLUB NAME + FIRE EMOJI */}
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

              <p className="text-gray-400 mb-2">
                Average Rating: {renderAverage(club)}
              </p>

              <div className="flex flex-wrap space-x-1">
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
            </div>
          );
        })}
      </div>

      <footer className="mt-6 text-gray-400 text-sm text-center">
        Ratings & Comments reset daily at 6:00 AM PST
      </footer>

      {currentClubForComments && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
          <div className="bg-gray-900 text-white w-80 h-full shadow-lg overflow-y-auto p-4 relative">
            <button
              className="float-right top-4 right-4 text-gray-400 hover:text-gray-200"
              onClick={() => setCurrentClubForComments(null)}
            >
              Close
            </button>
            <h2 className="text-2xl font-bold mb-4">
              {currentClubForComments}
            </h2>
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
    </div>
  );
};

export default App;