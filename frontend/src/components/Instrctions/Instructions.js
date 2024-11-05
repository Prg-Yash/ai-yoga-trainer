import React, { useState } from "react";
import { poseInstructions } from "../../utils/data";
import { poseImages } from "../../utils/pose_images";
import { AudioLines, PauseCircle } from "lucide-react"; // Assuming PauseCircle is the pause icon
import "./Instructions.css";

export default function Instructions({ currentPose }) {
  const [instructions] = useState(poseInstructions);
  const [isPlaying, setIsPlaying] = useState(false);

  const playInstructions = () => {
    const speech = new SpeechSynthesisUtterance();
    speech.lang = "en-US";
    speech.text = instructions[currentPose].join(" ");

    // Handle the end of the speech to reset the icon
    speech.onend = () => {
      setIsPlaying(false);
    };

    if (isPlaying) {
      // Pause audio and reset state
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      // Play audio and set state
      window.speechSynthesis.speak(speech);
      setIsPlaying(true);
    }
  };

  return (
    <div className="instructions-main-container">
      <div className="instructions-container">
        <ul className="instructions-list">
          {instructions[currentPose].map((instruction, index) => (
            <li key={index} className="instruction">
              {instruction}
            </li>
          ))}
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
        onClick={playInstructions}
      >
        {isPlaying ? <PauseCircle /> : <AudioLines />}
      </div>
    </div>
  );
}
