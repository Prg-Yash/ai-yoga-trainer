import React, { useState } from "react";

import { poseInstructions } from "../../utils/data";

import { poseImages } from "../../utils/pose_images";
import { AudioLines } from "lucide-react";
import "./Instructions.css";

export default function Instructions({ currentPose }) {
  const [instructions, setInstructions] = useState(poseInstructions);
  const playInstructions = () => {
    //tts
    const speech = new SpeechSynthesisUtterance();
    speech.lang = "en-US";
    speech.text = instructions[currentPose].join(" ");

    window.speechSynthesis.speak(speech);
  };
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
      <div
        style={{
          position: "absolute",
          top: "24%",
          left: "51%",
          backgroundColor: "white",
          color: "black",
          borderRadius: "50%",
          padding: "5px",
          cursor: "pointer",
        }}
        onClick={() => playInstructions()}
      >
        <AudioLines />
      </div>
    </div>
  );
}
