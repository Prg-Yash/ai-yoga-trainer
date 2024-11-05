import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useNavigate } from "react-router-dom";
import { poseImages } from "../../utils/pose_images/";
import { BicepsFlexed, Clock, Dumbbell, Swords, Trash, X } from "lucide-react";
import "./CreateWorkout.css";
import Header from "../../components/Header/Header";
import { toast } from "react-hot-toast";
import Footer from "../../components/Footer/Footer";

const CreateWorkout = () => {
  const poseList = [
    "Tree",
    "Chair",
    "Cobra",
    "Warrior",
    "Dog",
    "Shoulderstand",
    "Traingle",
  ];
  const [myWorkout, setMyWorkout] = useState([]);
  const [poseDurations, setPoseDurations] = useState({});
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [initialWorkout, setInitialWorkout] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load history from localStorage on component mount
    const storedHistory =
      JSON.parse(localStorage.getItem("workoutHistory")) || [];
    setWorkoutHistory(storedHistory);
  }, []);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(myWorkout);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setMyWorkout(items);
  };

  const handlePoseDurationChange = (pose, duration) => {
    setPoseDurations((prevDurations) => ({
      ...prevDurations,
      [pose]: Number(duration),
    }));
  };

  const addToWorkout = (pose) => {
    if (!myWorkout.includes(pose)) {
      setMyWorkout([...myWorkout, pose]);
    }
  };

  const removeFromWorkout = (pose) => {
    setMyWorkout(myWorkout.filter((item) => item !== pose));
    const updatedDurations = { ...poseDurations };
    delete updatedDurations[pose];
    setPoseDurations(updatedDurations);
  };

  const saveWorkoutHistory = () => {
    const newWorkout = {
      poses: [...myWorkout],
      durations: { ...poseDurations },
      usageCount: 1,
    };
    const workoutExists = workoutHistory.find(
      (workout) =>
        JSON.stringify(workout.poses) === JSON.stringify(myWorkout) &&
        JSON.stringify(workout.durations) === JSON.stringify(poseDurations)
    );

    if (workoutExists) {
      // Update usage count if the workout already exists
      const updatedHistory = workoutHistory.map((workout) =>
        workout === workoutExists
          ? { ...workout, usageCount: workout.usageCount + 1 }
          : workout
      );
      setWorkoutHistory(updatedHistory);
      localStorage.setItem("workoutHistory", JSON.stringify(updatedHistory));
    } else {
      // Add new workout if it doesn't exist
      const updatedHistory = [
        ...workoutHistory,
        { ...newWorkout, name: `Yoga Workout ${workoutHistory.length + 1}` },
      ];
      setWorkoutHistory(updatedHistory);
      localStorage.setItem("workoutHistory", JSON.stringify(updatedHistory));
    }
  };

  const startWorkout = () => {
    if (
      JSON.stringify(myWorkout) !== JSON.stringify(initialWorkout) ||
      JSON.stringify(poseDurations) !== JSON.stringify(initialWorkout.durations)
    ) {
      saveWorkoutHistory();
    }
    navigate("/workout", { state: { myWorkout, poseDurations } });
  };

  const loadWorkout = (workout) => {
    setMyWorkout(workout.poses);
    setPoseDurations(workout.durations);
    setInitialWorkout(workout);
    toast.success(`Workout ${workout.name} loaded successfully!`);
  };

  const deleteWorkoutFromHistory = (index) => {
    const updatedHistory = workoutHistory.filter((_, i) => i !== index);
    setWorkoutHistory(updatedHistory);
    localStorage.setItem("workoutHistory", JSON.stringify(updatedHistory));
    toast.success(`Workout deleted successfully!`);
  };

  return (
    <>
      <Header />
      <div className="workout-creator-wrapper">
        <h1 className="workout-creator-heading">
          <Dumbbell />
          Create Your Workout
        </h1>

        <div className="workout-creator-content">
          <div className=" available-poses-section">
            <h2 className="workout-creator-card-title">
              <Swords />
              Available Poses
            </h2>
            <ul className="available-poses-list">
              {poseList.map((pose) => (
                <li
                  key={pose}
                  className="available-pose-item"
                  onClick={() => addToWorkout(pose)}
                >
                  <img src={poseImages[pose]} alt={pose} />
                  <span>{pose}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="workout-creator-card my-workout-section">
            <div>
              <h2 className="workout-creator-card-title">
                <BicepsFlexed />
                My Workout
              </h2>
              {myWorkout.length === 0 && (
                <p className="my-workout-empty-message">
                  Please add poses to your workout!
                </p>
              )}
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="my-workout">
                  {(provided) => (
                    <ul
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="my-workout-list"
                    >
                      {myWorkout.map((pose, index) => (
                        <Draggable key={pose} draggableId={pose} index={index}>
                          {(provided) => (
                            <li
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="my-workout-item"
                            >
                              <div className="my-workout-item-content">
                                <img src={poseImages[pose]} alt={pose} />
                                <span>{pose}</span>
                              </div>
                              <div className="my-workout-item-actions">
                                <input
                                  type="number"
                                  min="10"
                                  value={poseDurations[pose] || 10}
                                  onChange={(e) =>
                                    handlePoseDurationChange(
                                      pose,
                                      e.target.value
                                    )
                                  }
                                  className="my-workout-duration-input"
                                />
                                <button
                                  onClick={() => removeFromWorkout(pose)}
                                  className="my-workout-remove-button"
                                >
                                  <X />
                                </button>
                              </div>
                            </li>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </ul>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
            <div>
              <button
                onClick={startWorkout}
                className="workout-creator-start-button"
                disabled={myWorkout.length === 0}
              >
                Start Workout
              </button>
            </div>
          </div>
        </div>

        <h2 className="workout-creator-section-heading">
          <Clock />
          Workout History
        </h2>
        {workoutHistory.length === 0 && (
          <p className="workout-history-empty-message">
            Create your first workout to see your history here!🧘
          </p>
        )}
        <div className="workout-history-grid">
          {workoutHistory
            .sort((a, b) => b.usageCount - a.usageCount)
            .map((workout, index) => (
              <div key={index} className="workout-history-card">
                <div>
                  <h3 className="workout-history-card-title">
                    {workout.name} - Used: {workout.usageCount} times
                  </h3>
                  <ul className="workout-history-pose-list">
                    {workout.poses.map((pose) => (
                      <li key={pose} className="workout-history-pose-item">
                        <img src={poseImages[pose]} alt={pose} />
                        <span>{pose}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="workout-history-card-actions">
                    <button
                      onClick={() => loadWorkout(workout)}
                      className="workout-history-load-button"
                    >
                      Load Workout
                    </button>
                    <button
                      onClick={() => deleteWorkoutFromHistory(index)}
                      className="workout-history-delete-button"
                    >
                      <Trash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CreateWorkout;
