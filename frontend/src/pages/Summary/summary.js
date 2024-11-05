import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Summary.css";

const Summary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const workoutSummary = location.state?.workoutSummary || [];
  console.log(workoutSummary);

  // Calculate total calories burned with numeric conversion and rounding
  const totalCalories = workoutSummary
    .reduce((total, item) => total + Number(item.calories || 0), 0)
    .toFixed(2);

  return (
    <>
      <div className="summary-wrapper">
        <div className="summary-container">
          <h1>Workout Summary</h1>
          <div className="summary-stats">
            <h2>Total Calories Burned: {totalCalories} kcal</h2>
          </div>
          <div className="pose-details">
            {workoutSummary.map((pose, index) => (
              <div key={index} className="pose-summary">
                <h3>{pose.pose}</h3>
                <p>Duration: {pose.duration} seconds</p>
                <p>Accuracy: {pose.accuracy}%</p>
                <p>
                  Calories Burned: {Number(pose.calories || 0).toFixed(2)} kcal
                </p>
              </div>
            ))}
          </div>
          <Link to="/" style={{ textDecoration: "none" }}>
            <button className="back-button">Back to Home</button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Summary;
