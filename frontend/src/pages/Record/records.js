// Records.js
import React, { useEffect, useState } from "react";

const Records = () => {
  const [bestTimes, setBestTimes] = useState({});

  useEffect(() => {
    // Load best times from local storage when the page loads
    const storedBestTimes = JSON.parse(localStorage.getItem("bestTimes")) || {};
    setBestTimes(storedBestTimes);
  }, []);

  return (
    <div className="records-container">
      <h1>Pose Best Times</h1>
      <ul className="pose-records-list">
        {Object.entries(bestTimes).length > 0 ? (
          Object.entries(bestTimes).map(([pose, time]) => (
            <li key={pose} className="pose-record">
              <span>{pose}</span>: <span>{time} seconds</span>
            </li>
          ))
        ) : (
          <p>No records available.</p>
        )}
      </ul>
    </div>
  );
};

export default Records;
