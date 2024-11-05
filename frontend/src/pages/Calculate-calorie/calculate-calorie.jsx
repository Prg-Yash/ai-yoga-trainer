import React, { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import removeMd from "remove-markdown";
import "./Calculate-Calories.css";
import Header from "../../components/Header/Header";
import { CookingPot } from "lucide-react";
import Footer from "../../components/Footer/Footer";

const apiKey = "AIzaSyBeR6O0uLPClOWAG9LBD1SHdpjvrYvd8DI";
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 512,
  responseMimeType: "text/plain",
};

const CalorieCalculator = () => {
  const [food, setFood] = useState("");
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState("grams");
  const [nutrition, setNutrition] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCalculate = async () => {
    if (!food || !weight) {
      setError("Please enter the food item, weight, and unit.");
      return;
    }

    setIsLoading(true);
    setError("");

    const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [
            {
              text: `Calculate the calories, protein, carbs, and fats for ${weight} ${unit} of ${food}. Return results for the default or raw form if possible. Display values separately for calories, protein, carbs, and fats.`,
            },
          ],
        },
      ],
    });

    try {
      const result = await chatSession.sendMessage(
        `Calculate nutrition for ${weight} ${unit} of ${food} in a simple format: calories, protein, carbs, and fats separately.`
      );

      const responseText =
        typeof result.response.text === "function"
          ? await result.response.text()
          : result.response;
      const parsedResult = parseNutritionResponse(responseText);
      setNutrition(parsedResult);
    } catch (err) {
      setError("Failed to calculate. Please try again.");
      console.error("Error in handleCalculate:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const parseNutritionResponse = (responseText) => {
    const lines = removeMd(responseText).split("\n");
    const nutritionData = {};

    lines.forEach((line) => {
      if (line.toLowerCase().includes("calories")) {
        nutritionData.calories = line
          .split(":")[1]
          ?.replace(/\*\*/g, "")
          .trim();
      } else if (line.toLowerCase().includes("protein")) {
        nutritionData.protein = line.split(":")[1]?.replace(/\*\*/g, "").trim();
      } else if (
        line.toLowerCase().includes("carbs") ||
        line.toLowerCase().includes("carbohydrates")
      ) {
        nutritionData.carbs = line.split(":")[1]?.replace(/\*\*/g, "").trim();
      } else if (line.toLowerCase().includes("fat")) {
        nutritionData.fat = line.split(":")[1]?.replace(/\*\*/g, "").trim();
      }
    });

    return nutritionData;
  };

  return (
    <>
      <Header />
      <div className="calorie-container">
        <div className="calorie-calculator">
          <h1 className="calorie-title">
            <CookingPot />
            Calorie Calculator
          </h1>
          <div className="input-group">
            <label htmlFor="food">Food Item</label>
            <input
              id="food"
              type="text"
              placeholder="e.g., chicken breast"
              value={food}
              onChange={(e) => setFood(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="weight">Weight</label>
            <input
              id="weight"
              type="number"
              placeholder="Enter weight"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="unit">Unit</label>
            <select
              id="unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            >
              <option value="grams">grams</option>
              <option value="kg">kg</option>
              <option value="oz">oz</option>
              <option value="lbs">lbs</option>
            </select>
          </div>
          <button
            className="calorie-button"
            onClick={handleCalculate}
            disabled={isLoading}
          >
            {isLoading ? "Calculating..." : "Calculate"}
          </button>
          {error && <p className="error">{error}</p>}
          {nutrition && (
            <div className="nutrition-result">
              <h2>Nutrition Information</h2>
              <div className="nutrition-grid">
                <div className="nutrition-item">
                  <span className="nutrition-label">Calories:</span>
                  <span className="nutrition-value">
                    {nutrition.calories || "N/A"}
                  </span>
                </div>
                <div className="nutrition-item">
                  <span className="nutrition-label">Protein:</span>
                  <span className="nutrition-value">
                    {nutrition.protein || "N/A"}
                  </span>
                </div>
                <div className="nutrition-item">
                  <span className="nutrition-label">Carbs:</span>
                  <span className="nutrition-value">
                    {nutrition.carbs || "N/A"}
                  </span>
                </div>
                <div className="nutrition-item">
                  <span className="nutrition-label">Fat:</span>
                  <span className="nutrition-value">
                    {nutrition.fat || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CalorieCalculator;
