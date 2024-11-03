import React, { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs";
import { POINTS, keypointConnections } from "../../utils/data";
import { drawPoint, drawSegment } from "../../utils/helper";
import { count } from "../../utils/music";
import { poseImages } from "../../utils/pose_images";
import "./Workout.css";

const Workout = () => {
  const CLASS_NO = {
    Chair: 0,
    Cobra: 1,
    Dog: 2,
    Goddess: 3,
    Shoulderstand: 4,
    Traingle: 5,
    Tree: 6,
    Warrior: 7,
  };

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const audioRef = useRef(new Audio(count));
  const detectorRef = useRef(null);
  const classifierRef = useRef(null);
  const detectionIntervalRef = useRef(null);

  audioRef.current.loop = true;

  const location = useLocation();
  const navigate = useNavigate();

  const { myWorkout = [], poseDurations = {} } = location.state || {};
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [poseTimer, setPoseTimer] = useState(poseDurations[myWorkout[0]] || 10);
  const [isPoseCorrect, setIsPoseCorrect] = useState(false);
  const [isDetecting, setIsDetecting] = useState(true);

  let skeletonColor = "rgb(255,255,255)";
  let flag = false;

  const speak = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    window.speechSynthesis.speak(speech);
  };

  function landmarks_to_embedding(landmarks) {
    landmarks = normalize_pose_landmarks(tf.expandDims(landmarks, 0));
    let embedding = tf.reshape(landmarks, [1, 34]);
    return embedding;
  }

  function normalize_pose_landmarks(landmarks) {
    let pose_center = get_center_point(
      landmarks,
      POINTS.LEFT_HIP,
      POINTS.RIGHT_HIP
    );
    pose_center = tf.expandDims(pose_center, 1);
    pose_center = tf.broadcastTo(pose_center, [1, 17, 2]);
    landmarks = tf.sub(landmarks, pose_center);

    let pose_size = get_pose_size(landmarks);
    landmarks = tf.div(landmarks, pose_size);
    return landmarks;
  }

  function get_center_point(landmarks, left_bodypart, right_bodypart) {
    let left = tf.gather(landmarks, left_bodypart, 1);
    let right = tf.gather(landmarks, right_bodypart, 1);
    return tf.add(tf.mul(left, 0.5), tf.mul(right, 0.5));
  }

  function get_pose_size(landmarks, torso_size_multiplier = 2.5) {
    let hips_center = get_center_point(
      landmarks,
      POINTS.LEFT_HIP,
      POINTS.RIGHT_HIP
    );
    let shoulders_center = get_center_point(
      landmarks,
      POINTS.LEFT_SHOULDER,
      POINTS.RIGHT_SHOULDER
    );
    let torso_size = tf.norm(tf.sub(shoulders_center, hips_center));
    let pose_center_new = get_center_point(
      landmarks,
      POINTS.LEFT_HIP,
      POINTS.RIGHT_HIP
    );
    pose_center_new = tf.expandDims(pose_center_new, 1);
    pose_center_new = tf.broadcastTo(pose_center_new, [1, 17, 2]);
    let d = tf.gather(tf.sub(landmarks, pose_center_new), 0, 0);
    let max_dist = tf.max(tf.norm(d, "euclidean", 0));
    return tf.maximum(tf.mul(torso_size, torso_size_multiplier), max_dist);
  }

  useEffect(() => {
    if (!myWorkout.length) {
      navigate("/create-workout");
    }
  }, [myWorkout, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPoseCorrect && poseTimer > 0) {
        setPoseTimer((prevTimer) => prevTimer - 1);
      }
      if (poseTimer === 0) {
        moveToNextPose();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPoseCorrect, poseTimer]);

  // Initialize pose detection
  useEffect(() => {
    initializePoseDetection();
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
      setIsDetecting(false);
    };
  }, []);

  // Handle pose changes
  useEffect(() => {
    if (detectorRef.current && classifierRef.current) {
      // Clear existing detection interval
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }

      // Reset states
      setIsPoseCorrect(false);
      flag = false;
      skeletonColor = "rgb(255,255,255)";

      // Start new detection interval for current pose
      detectionIntervalRef.current = setInterval(() => {
        if (isDetecting) {
          detectPose(
            detectorRef.current,
            classifierRef.current,
            audioRef.current
          );
        }
      }, 100);
    }
  }, [currentPoseIndex, isDetecting]);

  const initializePoseDetection = async () => {
    const detectorConfig = {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
    };
    detectorRef.current = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      detectorConfig
    );
    classifierRef.current = await tf.loadLayersModel(
      "https://models.s3.jp-tok.cloud-object-storage.appdomain.cloud/model.json"
    );

    audioRef.current = new Audio(count);
    audioRef.current.loop = true;

    // Start initial detection
    detectionIntervalRef.current = setInterval(() => {
      if (isDetecting) {
        detectPose(
          detectorRef.current,
          classifierRef.current,
          audioRef.current
        );
      }
    }, 100);
  };

  const moveToNextPose = () => {
    setIsDetecting(false);

    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }

    audioRef.current.pause();
    audioRef.current.currentTime = 0;

    flag = false;
    skeletonColor = "rgb(255,255,255)";
    setIsPoseCorrect(false);

    if (currentPoseIndex < myWorkout.length - 1) {
      setCurrentPoseIndex((prevIndex) => prevIndex + 1);
      const nextPoseDuration =
        poseDurations[myWorkout[currentPoseIndex + 1]] || 10;
      setPoseTimer(nextPoseDuration);

      // Speak the next pose and its duration
      speak(
        `Perform ${
          myWorkout[currentPoseIndex + 1]
        } pose for ${nextPoseDuration} seconds`
      );

      setTimeout(() => {
        setIsDetecting(true);
      }, 500);
    } else {
      // Announce workout completion
      speak("You have successfully completed all the workouts!");
      alert("Workout complete!");
      navigate("/");
    }
  };

  const detectPose = async (detector, poseClassifier, countAudio) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      let notDetected = 0;
      const video = webcamRef.current.video;
      const pose = await detector.estimatePoses(video);
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      try {
        const keypoints = pose[0].keypoints;
        let input = keypoints.map((keypoint) => {
          if (keypoint.score > 0.4) {
            if (
              !(keypoint.name === "left_eye" || keypoint.name === "right_eye")
            ) {
              drawPoint(ctx, keypoint.x, keypoint.y, 8, "rgb(255,255,255)");
              let connections = keypointConnections[keypoint.name];
              connections?.forEach((connection) => {
                let conName = connection.toUpperCase();
                drawSegment(
                  ctx,
                  [keypoint.x, keypoint.y],
                  [keypoints[POINTS[conName]].x, keypoints[POINTS[conName]].y],
                  skeletonColor
                );
              });
            }
          } else {
            notDetected += 1;
          }
          return [keypoint.x, keypoint.y];
        });

        if (notDetected > 4) {
          skeletonColor = "rgb(255,255,255)";
          return;
        }

        const processedInput = landmarks_to_embedding(input);
        const classification = poseClassifier.predict(processedInput);
        classification.array().then((data) => {
          const classNo = CLASS_NO[myWorkout[currentPoseIndex]];
          if (data[0][classNo] > 0.97) {
            if (!flag) {
              flag = true;
              countAudio.play();
            }
            skeletonColor = "rgb(0,255,0)";
            setIsPoseCorrect(true);
          } else {
            skeletonColor = "rgb(255,255,255)";
            setIsPoseCorrect(false);
          }
        });
      } catch (err) {
        console.error("Pose detection error:", err);
      }
    }
  };

  return (
    <div className="workout-container">
      <div className="left-section">
        <Webcam
          width="640px"
          height="480px"
          id="webcam"
          ref={webcamRef}
          className="webcam"
        />
        <canvas
          ref={canvasRef}
          id="my-canvas"
          width="640px"
          height="480px"
          className="canvas-overlay"
        ></canvas>
      </div>
      <div className="right-section">
        <div className="current-pose">
          <img
            src={poseImages[myWorkout[currentPoseIndex]]}
            alt="Current Pose"
            className="pose-image"
          />
          <h3 className="pose-name">{myWorkout[currentPoseIndex]}</h3>
          <div className="timer">{poseTimer} seconds</div>
        </div>
        <div className="pose-queue">
          <h4>Upcoming Poses</h4>
          {myWorkout.slice(currentPoseIndex + 1).length === 0 && (
            <p>No more poses in queue</p>
          )}
          {myWorkout.slice(currentPoseIndex + 1).map((pose, index) => (
            <div key={index} className="queue-item">
              <img src={poseImages[pose]} alt={pose} className="queue-image" />
              <span>{pose}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Workout;
