const Ingredient = require('../models/ingredientModel');

// toggles if a user has an ingredient
exports.toggleIngredient = async (req, res) => {
  const { name, userId, isSelected } = req.body;
  try {
    if (isSelected) {
      const data = await Ingredient.add(name, userId);
      return res.status(201).json(data);
    } else {
      const data = await Ingredient.remove(name, userId);
      return res.status(200).json(data);
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};