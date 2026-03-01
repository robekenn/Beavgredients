const MealModel = require('../models/mealModel');

exports.getFilteredMeals = async (req, res) => {
  try {
    const { type, userId } = req.body;
    
    // 1. Fetch the data from the Model
    // The Model already handles formatting id, name, image, and ingredients
    const meals = await MealModel.filterByPantry(userId, type);

    // 2. Default to empty array if no results are found
    const safeMeals = meals || [];

    // 3. Send the formatted results directly to the frontend
    // This ensures 'name' and 'image' are preserved so the grid isn't blank
    res.json(safeMeals);

  } catch (error) {
    // Log the error for backend debugging
    console.error("SERVER ERROR IN getFilteredMeals:", error);
    
    // Return an empty array to prevent the frontend grid from crashing
    res.status(500).json([]);
  }
};