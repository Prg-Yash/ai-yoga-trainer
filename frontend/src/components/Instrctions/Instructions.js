import React, { useState } from "react";

import { poseInstructions } from "../../utils/data";

import { poseImages } from "../../utils/pose_images";

import "./Instructions.css";
import { div } from "@tensorflow/tfjs";

export default function Instructions({ currentPose }) {
  const [instructions, setInsntructions] = useState(poseInstructions);

  return (
    <div className="instructions-main-container">
      <div className="instructions-container">
        <ul className="instructions-list">
          {instructions[currentPose].map((instruction) => {
            return <li className="instruction">{instruction}</li>;
          })}
        </ul>

        <img
          alt="pose"
          className="pose-demo-img"
          src={poseImages[currentPose]}
        />
      </div>
    </div>
  );
}
