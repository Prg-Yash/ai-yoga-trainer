import React, { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "./CalorieTracker.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

const genAI = new GoogleGenerativeAI("AIzaSyBeR6O0uLPClOWAG9LBD1SHdpjvrYvd8DI");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
};

const CalorieTracker = () => {
  // User Profile State
  const [weight, setWeight] = useState("");
  const [goal, setGoal] = useState("maintenance");
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState(null);
  const [loading, setLoading] = useState(false);

  // Food Entry State
  const [foodName, setFoodName] = useState("");
  const [foodWeight, setFoodWeight] = useState("");

  const [caloriesConsumed, setCaloriesConsumed] = useState(0);

  // History State
  const [foodHistory, setFoodHistory] = useState([]);

  // Chat Session State
  const [chatSession, setChatSession] = useState(null);

  // Initialize chat session
  useEffect(() => {
    const initializeChat = async () => {
      const session = model.startChat({
        generationConfig,
        history: [
          {
            role: "user",
            parts: [
              {
                text: "You are a calorie tracker which suggests daily calories of the user based on the body weight and fitness goal (maintenance, weight loss, muscle gain). You also calculate the total number of calories of the food given of any one type (mostly raw or standard). Provide only numerical values in your responses, no explanations needed.",
              },
            ],
          },
        ],
      });
      setChatSession(session);
    };

    initializeChat();
  }, []);

  // Load data from localStorage
  useEffect(() => {
    const savedCalories = localStorage.getItem("dailyCalorieGoal");
    const savedConsumed = localStorage.getItem("caloriesConsumed");
    const savedHistory = localStorage.getItem("foodHistory");

    if (savedCalories) setDailyCalorieGoal(parseInt(savedCalories));
    if (savedConsumed) setCaloriesConsumed(parseInt(savedConsumed));
    if (savedHistory) setFoodHistory(JSON.parse(savedHistory));
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (dailyCalorieGoal)
      localStorage.setItem("dailyCalorieGoal", dailyCalorieGoal);
    localStorage.setItem("caloriesConsumed", caloriesConsumed);
    localStorage.setItem("foodHistory", JSON.stringify(foodHistory));
  }, [dailyCalorieGoal, caloriesConsumed, foodHistory]);

  const handleSuggestCalories = async () => {
    if (!chatSession || !weight || !goal) return;

    try {
      setLoading(true);
      const prompt = `Based on a weight of ${weight}kg and fitness goal of ${goal}, what should be the daily calorie intake? Respond with just the number, no text.`;

      const result = await chatSession.sendMessage(prompt);
      const calories = parseInt(result.response.text().trim());

      if (!isNaN(calories)) {
        setDailyCalorieGoal(calories);
      }
    } catch (error) {
      console.error("Error calculating calories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFood = async () => {
    if (!chatSession || !foodName || !foodWeight) return;

    try {
      setLoading(true);
      const prompt = `How many calories are in ${foodWeight}g of ${foodName} ? Respond with just the number, no text. If there are types in the food like raw, cooked, grilled then mostly give the calories of raw food or cooked food.`;

      const result = await chatSession.sendMessage(prompt);
      const calories = parseInt(result.response.text().trim());

      if (!isNaN(calories)) {
        const newFoodEntry = {
          id: Date.now(),
          name: foodName,
          weight: foodWeight,
          calories: calories,
          timestamp: new Date().toISOString(),
        };

        setFoodHistory((prev) => [newFoodEntry, ...prev]);
        setCaloriesConsumed((prev) => prev + calories);

        // Clear form
        setFoodName("");
        setFoodWeight("");
      }
    } catch (error) {
      console.error("Error calculating food calories:", error);
    } finally {
      setLoading(false);
    }
  };

  // TTS Functionality
  const speak = (message) => {
    const utterance = new SpeechSynthesisUtterance(message);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (dailyCalorieGoal && caloriesConsumed > dailyCalorieGoal * 0.9) {
      if (caloriesConsumed > dailyCalorieGoal) {
        speak("You have exceeded the daily calorie goal.");
      } else {
        speak("You are close to the daily calorie goal.");
      }
    }
  }, [caloriesConsumed, dailyCalorieGoal]);

  return (
    <>
      <div className="calorie-tracker-container">
        <Header />
        <div
          className={`${
            !dailyCalorieGoal ? "calorie-tracker" : "calorie-tracker-empty"
          }`}
        >
          {loading && (
            <div className="loading-overlay">
              <div className="loading-spinner"></div>
            </div>
          )}
          {dailyCalorieGoal && caloriesConsumed > dailyCalorieGoal * 0.9 && (
            <div
              className={`alert ${
                caloriesConsumed > dailyCalorieGoal
                  ? "alert-danger"
                  : "alert-warning"
              }`}
            >
              <h3>Calorie Goal Alert</h3>
              <p>
                You've{" "}
                {caloriesConsumed > dailyCalorieGoal
                  ? "exceeded"
                  : "nearly reached"}{" "}
                your daily calorie goal!
              </p>
            </div>
          )}
          {/* Initial Setup Section */}
          {!dailyCalorieGoal && (
            <div className="card setup-card">
              <h2>Set Your Daily Goal</h2>
              <div className="form-group">
                <label>Weight (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Enter your weight"
                />
              </div>
              <div className="form-group">
                <label>Fitness Goal</label>
                <select value={goal} onChange={(e) => setGoal(e.target.value)}>
                  <option value="maintenance">Maintenance</option>
                  <option value="weightloss">Weight Loss</option>
                  <option value="musclegain">Muscle Gain</option>
                </select>
              </div>
              <button
                onClick={handleSuggestCalories}
                className="button primary"
                disabled={loading || !weight}
              >
                Get AI Calorie Suggestion
              </button>
            </div>
          )}

          {/* Daily Progress Section */}
          {dailyCalorieGoal && (
            <div className="progress-grid">
              <div className="card progress-card">
                <h2>Daily Goal</h2>
                <div className="calorie-display">
                  {dailyCalorieGoal} calories
                </div>
              </div>

              <div className="card progress-card">
                <h2>Calories Consumed</h2>
                <div className="calorie-display">
                  {caloriesConsumed} calories
                </div>
              </div>
            </div>
          )}

          {/* Food Entry Section */}
          {dailyCalorieGoal && (
            <div className="card food-entry-card">
              <h2>Add Food</h2>
              <div className="food-entry-grid">
                <div className="form-group">
                  <label>Food Name</label>
                  <input
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                    placeholder="Enter food name"
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>Weight (g)</label>
                  <input
                    type="number"
                    value={foodWeight}
                    onChange={(e) => setFoodWeight(e.target.value)}
                    placeholder="Enter weight in grams"
                    disabled={loading}
                  />
                </div>
              </div>
              <button
                onClick={handleAddFood}
                className="button primary"
                disabled={loading || !foodName || !foodWeight}
              >
                Calculate & Add Food
              </button>
            </div>
          )}

          {/* History Section */}
          {foodHistory.length > 0 && (
            <div className="history-section">
              <h2 className="history-title">Today's Food History</h2>
              <div className="history-grid">
                {foodHistory.map((entry) => (
                  <div key={entry.id} className="card history-card">
                    <div className="history-content">
                      <div className="history-details">
                        <h3>{entry.name}</h3>
                        <p className="text-muted">
                          {entry.weight}g ({entry.type})
                        </p>
                      </div>
                      <div className="history-calories">
                        {entry.calories} cal
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </>
  );
};

export default CalorieTracker;
