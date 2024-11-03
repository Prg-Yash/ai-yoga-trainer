import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useNavigate } from "react-router-dom";
import { poseImages } from "../../utils/pose_images/";
import { Clock, Dumbbell, Swords } from "lucide-react";
import "./CreateWorkout.css";
import Header from "../../components/Header/Header";
const CreateWorkout = () => {
  const poseList = [
    "Tree",
    "Chair",
    "Cobra",
    "Warrior",
    "Dog",
    "Shoulderstand",
    "Triangle",
  ];
  const [myWorkout, setMyWorkout] = useState([]);
  const [poseDurations, setPoseDurations] = useState({});
  const navigate = useNavigate();

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

  const startWorkout = () => {
    navigate("/workout", { state: { myWorkout, poseDurations } });
  };

  return (
    <>
      <Header />
      <div className="create-workout-container">
        <h1 className="create-workout-heading">
          <Dumbbell />
          Create Your Workout
        </h1>
        <div className="grid-container">
          <div className="pose-list-container">
            <h2 className="pose-list-title">
              <Swords />
              Available Poses
            </h2>
            <ul className="pose-list">
              {poseList.map((pose) => (
                <li
                  key={pose}
                  className="pose-item"
                  onClick={() => addToWorkout(pose)}
                >
                  <img src={poseImages[pose]} alt={pose} />
                  <span>{pose}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="my-workout-container">
            <h2 className="pose-list-title">
              <Clock />
              My Workout
            </h2>
            {myWorkout.length === 0 && (
              <p
                style={{
                  color: "orange",
                  textAlign: "center",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  margin: "0",
                }}
              >
                Please add poses to your workout!!
              </p>
            )}
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="my-workout">
                {(provided) => (
                  <ul
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="my-workout"
                  >
                    {myWorkout.map((pose, index) => (
                      <Draggable key={pose} draggableId={pose} index={index}>
                        {(provided) => (
                          <li
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="workout-item"
                          >
                            <img src={poseImages[pose]} alt={pose} />
                            <span>{pose}</span>
                            <input
                              type="number"
                              min="10"
                              value={poseDurations[pose] || 10}
                              onChange={(e) =>
                                handlePoseDurationChange(pose, e.target.value)
                              }
                              className="duration-input"
                            />
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
        </div>
        <button
          onClick={startWorkout}
          className={`start-button ${myWorkout.length === 0 ? "disabled" : ""}`}
          style={
            myWorkout.length === 0
              ? {
                  backgroundColor: "gray",
                  color: "white",
                  cursor: "not-allowed",
                }
              : { backgroundColor: "" }
          }
          disabled={myWorkout.length === 0}
        >
          Start Workout
        </button>
      </div>
    </>
  );
};

export default CreateWorkout;
