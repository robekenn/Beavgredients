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
const authRoutes = require('./routes/authRoutes');
const ingredientRoutes = require('./routes/ingredientRoutes');
const mealRoutes = require('./routes/mealRoutes');

// display meals 
app.get("/api/home", async (req, res) => { // used to be /api/home
  try {
    const { letter } = req.query;
    if (!letter){ // if null return error
      return res.status(400).json({error: "please provide page letter"});
    }
    // fetch the data from meal db
    const response = await axios.get('https://www.themealdb.com/api/json/v1/1/search.php?', {
      params: { f: letter }
    }); 
    //www.themealdb.com/api/json/v1/1/search.php?f=a
    // organize data fetched from TheMealDB
    const rawMealsData = response.data.meals || []; // if meal db returns nothing response is an empty array instead of mapping error
    const organizedMeals = rawMealsData.map(meal => {
  // 1. Start with the basic info
  const formatted = {
    id: meal.idMeal,
    image: meal.strMealThumb,
    name: meal.strMeal,
    category: meal.strCategory,
    area: meal.strArea,
    recipe: meal.strInstructions,
  };

  // 2. Loop through and add all 20 ingredients so the Kart can see them
  for (let i = 1; i <= 20; i++) {
    formatted[`strIngredient${i}`] = meal[`strIngredient${i}`];
    formatted[`strMeasure${i}`] = meal[`strMeasure${i}`];
  }

  return formatted;
});
    res.json(organizedMeals);
  } catch (error) {
    console.error("Error fetching meal data from TheMealDB", error);
    res.status(500).json({ error: "internal server error" });
  }
});

// display meals based on search
app.get("/api/search", async (req, res) => {
  try {
    const { mealName }  = req.query;
    if (!mealName){ // if null return error
      return res.status(400).json({error: "please provide meal name"}); 
    }
    // fetch the data from meal db
    const response = await axios.get('https://www.themealdb.com/api/json/v1/1/search.php?', {
      params: { s: mealName }
    }); 
    // organize data fetched from TheMealDB
    const rawMealsData = response.data.meals || [];
    const organizedMeals = rawMealsData.map(meal => {
  // 1. Start with the basic info
  const formatted = {
    id: meal.idMeal,
    image: meal.strMealThumb,
    name: meal.strMeal,
    category: meal.strCategory,
    area: meal.strArea,
    recipe: meal.strInstructions,
  };

  // 2. Loop through and add all 20 ingredients so the Kart can see them
  for (let i = 1; i <= 20; i++) {
    formatted[`strIngredient${i}`] = meal[`strIngredient${i}`];
    formatted[`strMeasure${i}`] = meal[`strMeasure${i}`];
  }

  return formatted;
});
    res.json(organizedMeals);
  } catch (error) {
    console.error("Error fetching meal data from TheMealDB", error);
    res.status(500).json({ error: "internal server error" });
  }
});

// Use the Routes
app.use("/api/auth", authRoutes);
app.use("/api/ingredients", ingredientRoutes);

app.use('/api/meals', mealRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

