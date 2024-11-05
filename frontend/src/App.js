import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  BrowserRouter,
} from "react-router-dom";

import Home from "./pages/Home/Home";
import Yoga from "./pages/Yoga/Yoga";
import About from "./pages/About/About";
import Tutorials from "./pages/Tutorials/Tutorials";
import CreateWorkout from "./pages/Cr-Workout/create-workout";
import Workout from "./pages/Workout/workout";
import CalculateCalorie from "./pages/Calculate-calorie/calculate-calorie";

import "./App.css";
import { Toaster } from "react-hot-toast";

import Summary from "./pages/Summary/summary";
import CalorieTracker from "./pages/Calorie-Tracker/calorie-tracker";

export default function App() {
  return (
    <>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/start" element={<Yoga />} />
          <Route path="/about" element={<About />} />
          <Route path="/tutorials" element={<Tutorials />} />
          <Route path="/create-workout" element={<CreateWorkout />} />
          <Route path="/workout" element={<Workout />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/calculate-calorie" element={<CalculateCalorie />} />
          <Route path="/calorie-tracker" element={<CalorieTracker />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
