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

const App = () => {
  const [ratings, setRatings] = useState({});
  const [ratedLocations, setRatedLocations] = useState(new Set());
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    // Listen for real-time updates from Firebase
    const commentsRef = ref(database, 'comments');
    onValue(commentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const sortedComments = Object.values(data).sort((a, b) => b.timestamp - a.timestamp);
        setComments(sortedComments);
      }
    });
  }, []);

  useEffect(() => {
    // Listen for real-time updates from Firebase
    const ratingsRef = ref(database, 'ratings');
    onValue(ratingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRatings(data);
      }
    });
  }, []);

  useEffect(() => {
    const now = new Date();
    const resetTime = new Date();
    resetTime.setHours(6, 0, 0, 0);
    if (now > resetTime) resetTime.setDate(resetTime.getDate() + 1);
  
    const timeout = setTimeout(() => {
      const commentsRef = ref(database, 'comments');
      const ratingsRef = ref(database, 'ratings');
      set(commentsRef, null); // Clear the comments node
      set(ratingsRef, null);
    }, resetTime - now);
  
    return () => clearTimeout(timeout);
  }, []);  

  const handleAddComment = () => {
    if (!newComment.trim()) return;
  
    const commentsRef = ref(database, `comments/${Date.now()}`);
    const commentData = {
      text: newComment,
      timestamp: Date.now(),
    };
  
    update(commentsRef, commentData);
    setNewComment('');
  };
  

  const handleRatingChange = (club, newRating) => {
    if (ratedLocations.has(club)) {
      alert('You have already rated this location.');
      return;
    }

    const clubRef = ref(database, `ratings/${club}`);
    const currentRating = ratings[club] || { total: 0, count: 0 };

    // Update Firebase with the new rating
    update(clubRef, {
      total: currentRating.total + newRating,
      count: currentRating.count + 1,
    });

    setRatedLocations((prev) => new Set(prev).add(club));
  };

  const renderAverage = (club) => {
    const clubRatings = ratings[club];
    if (!clubRatings || clubRatings.count === 0) return 'No ratings yet';
    return (clubRatings.total / clubRatings.count).toFixed(1);
  };

  return (
    <div className="min-h-screen w-screen flex flex-col items-center bg-black p-4 sm:p-6 lg:p-8">
      <h1 className="text-4xl font-bold text-neon-purple mb-6 text-center">
        Downtown San Diego & Pacific Beach Clubs/Bars Rating
      </h1>
      <div className="w-screen max-w-2xl bg-gray-900 shadow-lg rounded-lg p-4 sm:p-6 md:p-8">
      <button
        className="float-right px-4 py-2 text-sm sm:text-base sm:px-6 sm:py-3 bg-neon-purple text-black rounded hover:bg-purple-800 disabled:opacity-50"
        onClick={() => setShowComments(true)}
      >
        View Comments
      </button>
        {clubsAndBars.map((club) => (
          <div key={club} className="border-b border-neon-purple py-4">
            <h2 className="text-2xl font-semibold text-white mb-2">{club}</h2>
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
        ))}
      </div>
      <footer className="mt-6 text-gray-400 text-sm text-center">
        Ratings reset daily at 6:00 AM PST
      </footer>
      {showComments && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
          <div className="bg-gray-900 text-white w-80 h-full shadow-lg overflow-y-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Comments</h2>
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-200"
              onClick={() => setShowComments(false)}
            >
              Close
            </button>
            <div className="mt-4">
              <textarea
                className="w-full bg-gray-800 text-white rounded p-2"
                rows="3"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
              ></textarea>
              <button
                className="mt-2 bg-neon-purple px-4 py-2 rounded hover:bg-purple-800"
                onClick={handleAddComment}
              >
                Submit
              </button>
            </div>
            <div className="flex flex-col space-y-4">
              {comments.map((comment, index) => (
                <div key={index} className="border-b border-gray-700 pb-2">
                  <p>{comment.text}</p>
                  <p className="text-sm text-gray-500">{new Date(comment.timestamp).toLocaleString()}</p>
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