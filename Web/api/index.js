require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const authRoutes = require("./routes/authRoutes");
const ingredientRoutes = require("./routes/ingredientRoutes");

const app = express();

app.use(cors());
app.use(express.json());

/* =====================================================
   GET /api/home?letter=a
   ===================================================== */
app.get("/api/home", async (req, res) => {
  try {
    const { letter } = req.query;
    if (!letter) {
      return res.status(400).json({ error: "please provide page letter" });
    }

    const response = await axios.get(
      "https://www.themealdb.com/api/json/v1/1/search.php",
      { params: { f: letter } }
    );

    const rawMealsData = response.data.meals || [];

    const organizedMeals = rawMealsData.map((meal) => ({
      id: meal.idMeal,
      image: meal.strMealThumb,
      name: meal.strMeal,
      category: meal.strCategory,
      area: meal.strArea,
      recipe: meal.strInstructions,
    }));

    res.json(organizedMeals);
  } catch (error) {
    console.error("Error fetching meal data:", error);
    res.status(500).json({ error: "internal server error" });
  }
});


// GET /api/meals/:id  -> full meal details (includes strIngredient1..20)
app.get("/api/meals/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "meal id required" });

    const response = await axios.get(
      "https://www.themealdb.com/api/json/v1/1/lookup.php",
      { params: { i: id } }
    );

    const meal = response.data?.meals?.[0];
    if (!meal) return res.status(404).json({ error: "meal not found" });

    res.json(meal); // full MealDB object
  } catch (err) {
    console.error("Error fetching meal details:", err);
    res.status(500).json({ error: "internal server error" });
  }
});

/* =====================================================
   GET /api/search?mealName=chicken
   ===================================================== */
app.get("/api/search", async (req, res) => {
  try {
    const { mealName } = req.query;
    if (!mealName) {
      return res.status(400).json({ error: "please provide meal name" });
    }

    const response = await axios.get(
      "https://www.themealdb.com/api/json/v1/1/search.php",
      { params: { s: mealName } }
    );

    const rawMealsData = response.data.meals || [];

    const organizedMeals = rawMealsData.map((meal) => ({
      id: meal.idMeal,
      image: meal.strMealThumb,
      name: meal.strMeal,
      category: meal.strCategory,
      area: meal.strArea,
      recipe: meal.strInstructions,
    }));

    res.json(organizedMeals);
  } catch (error) {
    console.error("Error searching meals:", error);
    res.status(500).json({ error: "internal server error" });
  }
});

/* =====================================================
   GET /api/meals/:id  (IMPORTANT FOR CART)
   Returns FULL meal with strIngredient1..20
   ===================================================== */
app.get("/api/meals/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "meal id required" });
    }

    const response = await axios.get(
      "https://www.themealdb.com/api/json/v1/1/lookup.php",
      { params: { i: id } }
    );

    const meal = response.data?.meals?.[0];
    if (!meal) {
      return res.status(404).json({ error: "meal not found" });
    }

    // Return full object (includes strIngredient1..20)
    res.json(meal);
  } catch (error) {
    console.error("Error fetching meal details:", error);
    res.status(500).json({ error: "internal server error" });
  }
});

/* =====================================================
   POST /api/meals/filter
   Basic category filtering
   ===================================================== */
app.post("/api/meals/filter", async (req, res) => {
  try {
    const { type } = req.body;

    if (!type) return res.json([]);

    const response = await axios.get(
      "https://www.themealdb.com/api/json/v1/1/filter.php",
      { params: { c: type } }
    );

    const meals = response.data?.meals || [];

    const organizedMeals = meals.map((meal) => ({
      id: meal.idMeal,
      image: meal.strMealThumb,
      name: meal.strMeal,
      category: type,
    }));

    res.json(organizedMeals);
  } catch (error) {
    console.error("Error filtering meals:", error);
    res.status(500).json({ error: "internal server error" });
  }
});

/* =====================================================
   Other Routes
   ===================================================== */
app.use("/api/auth", authRoutes);
app.use("/api/ingredients", ingredientRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});