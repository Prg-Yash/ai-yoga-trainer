import React from "react";
import { Link } from "react-router-dom";

import "./Home.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import {
  Book,
  Calculator,
  Dumbbell,
  Play,
  Search,
  TrainTrack,
} from "lucide-react";

export default function Home() {
  return (
    <div>
      <Header />
      <main className="main-content container">
        <section className="hero">
          <div className="hero-text">
            <h1 className="hero-title">
              Your Personal
              <br />
              Yoga AI Trainer
            </h1>
            <p className="hero-description">
              Transform your practice with intelligent pose detection and
              real-time guidance. Experience the future of yoga, tailored just
              for you.
            </p>
            <div className="hero-buttons">
              <Link to="/start">
                <button className="btn btn-primary">Get Started</button>
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <img
              src="/yoga.avif"
              alt="Yoga AI Trainer"
              width="600"
              height="400"
            />
          </div>
        </section>

        <section className="features">
          <h2 className="features-title">
            <Search style={{ width: "40px", height: "40px" }} />
            Explore YogGuru
          </h2>
          <div className="features-grid">
            <div className="feature-card">
              <i data-lucide="play-circle" className="feature-icon"></i>
              <h3 className="feature-title">
                <Play />
                Start Your Journey
              </h3>
              <p className="feature-description">
                Begin your personalized yoga experience with AI-guided sessions.
              </p>
              <Link to={"/start"} className="feature-link">
                Let's Start →
              </Link>
            </div>
            <div className="feature-card">
              <h3 className="feature-title">
                {" "}
                <Book />
                Explore Tutorials
              </h3>
              <p className="feature-description">
                Access a wide range of yoga tutorials for all skill levels.
              </p>
              <Link to="/tutorials" className="feature-link">
                View Tutorials →
              </Link>
            </div>
            <div className="feature-card">
              <h3 className="feature-title">
                <Dumbbell />
                Custom Workouts
              </h3>
              <p className="feature-description">
                Design your own yoga routines tailored to your goals and
                preferences.
              </p>
              <Link to="create-workout" className="feature-link">
                Create Workout →
              </Link>
            </div>
            <div className="feature-card">
              <h3 className="feature-title">
                <Calculator />
                Calorie Calculator
              </h3>
              <p className="feature-description">
                Calculate the nutritional information of your food items.
              </p>
              <Link to="calculate-calorie" className="feature-link">
                View Calculator →
              </Link>
            </div>
            <div className="feature-card">
              <i data-lucide="dumbbell" className="feature-icon"></i>
              <h3 className="feature-title">
                <TrainTrack />
                Daily Calorie Tracker
              </h3>
              <p className="feature-description">
                Track your daily calorie intake and get personalized
                recommendations.
              </p>
              <Link to="calorie-tracker" className="feature-link">
                View Tracker →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
