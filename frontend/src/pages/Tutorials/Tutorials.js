import React from "react";

import "./Tutorials.css";

import { tutorials, fixCamera, customWorkouts } from "../../utils/data";
import Header from "../../components/Header/Header";

export default function Tutorials() {
  return (
    <>
      <Header />
      <div className="tutorials-container">
        <div>
          <h1 className="tutorials-heading">Basic Tutorials</h1>
          <div className="tutorials-content-container">
            {tutorials.map((tutorial) => (
              <p className="tutorials-content">{tutorial}</p>
            ))}
          </div>
        </div>
        <div>
          <h1 className="tutorials-heading">Want Custom Workouts?</h1>
          <div className="tutorials-content-container">
            {customWorkouts.map((tutorial) => (
              <p className="tutorials-content">{tutorial}</p>
            ))}
          </div>
        </div>
        <div>
          <h1 className="tutorials-heading">Camera Not Working?</h1>
          <div className="tutorials-content-container">
            {fixCamera.map((points) => (
              <p className="tutorials-content">{points}</p>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
