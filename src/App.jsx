import React, { useState, useEffect } from 'react';
import './index.css';

const clubsAndBars = [
  'Club 1',
  'Bar 1',
  'Club 2',
  'Bar 2',
  'Club 3',
  'Bar 3',
];

const App = () => {
  const [ratings, setRatings] = useState({});
  const [ratedLocations, setRatedLocations] = useState(new Set());

  useEffect(() => {
    // Reset ratings and rated locations at 6:00 AM PST daily.
    const now = new Date();
    const resetTime = new Date();
    resetTime.setHours(6, 0, 0, 0);
    if (now > resetTime) resetTime.setDate(resetTime.getDate() + 1);

    const timeout = setTimeout(() => {
      setRatings({});
      setRatedLocations(new Set());
    }, resetTime - now);
    return () => clearTimeout(timeout);
  }, []);

  const handleRatingChange = (club, newRating) => {
    if (ratedLocations.has(club)) {
      alert('You have already rated this location.');
      return;
    }

    setRatings((prev) => {
      const currentRating = prev[club] || { total: 0, count: 0 };
      return {
        ...prev,
        [club]: {
          total: currentRating.total + newRating,
          count: currentRating.count + 1,
        },
      };
    });

    setRatedLocations((prev) => new Set(prev).add(club));
  };

  const renderAverage = (club) => {
    const clubRatings = ratings[club];
    if (!clubRatings || clubRatings.count === 0) return 'No ratings yet';
    return (clubRatings.total / clubRatings.count).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Downtown San Diego & Pacific Beach Clubs/Bars Rating</h1>
      <div className="w-full max-w-2xl bg-white shadow-md rounded-lg p-6">
        {clubsAndBars.map((club) => (
          <div key={club} className="border-b py-4">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">{club}</h2>
            <p className="text-gray-600 mb-2">Average Rating: {renderAverage(club)}</p>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleRatingChange(club, rating)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  disabled={ratedLocations.has(club)}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <footer className="mt-6 text-gray-500 text-sm">Ratings reset daily at 6:00 AM PST</footer>
    </div>
  );
};

export default App;