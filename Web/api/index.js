require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "*", // tighten later to your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Import the Routes
const authRoutes = require("./routes/authRoutes");
const ingredientRoutes = require("./routes/ingredientRoutes");

/**
 * Helper: convert a TheMealDB meal object into your "organized" shape.
 */
function organizeMealBasic(meal) {
  return {
    id: meal.idMeal,
    image: meal.strMealThumb,
    name: meal.strMeal,
    category: meal.strCategory,
    area: meal.strArea,
    recipe: meal.strInstructions,
  };
}

/**
 * Home: meals by first letter
 * GET /home?letter=a
 */
app.get("/home", async (req, res) => {
  try {
    const { letter } = req.query;
    if (!letter) return res.status(400).json({ error: "please provide page letter" });

    const response = await axios.get("https://www.themealdb.com/api/json/v1/1/search.php?", {
      params: { f: letter },
    });

    const rawMealsData = response.data.meals || [];
    const organizedMeals = rawMealsData.map(organizeMealBasic);
    res.json(organizedMeals);
  } catch (error) {
    console.error("Error fetching meal data from TheMealDB", error);
    res.status(500).json({ error: "internal server error" });
  }
});

/**
 * Search: meals by name
 * GET /search?mealName=chicken
 */
app.get("/search", async (req, res) => {
  try {
    const { mealName } = req.query;
    if (!mealName) return res.status(400).json({ error: "please provide meal name" });

    const response = await axios.get("https://www.themealdb.com/api/json/v1/1/search.php?", {
      params: { s: mealName },
    });

    const rawMealsData = response.data.meals || [];
    const organizedMeals = rawMealsData.map(organizeMealBasic);
    res.json(organizedMeals);
  } catch (error) {
    console.error("Error fetching meal data from TheMealDB", error);
    res.status(500).json({ error: "internal server error" });
  }
});

// Use the Routes
app.use("/api/auth", authRoutes);
app.use("/api/ingredients", ingredientRoutes);

module.exports = app;

// Local dev only
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}