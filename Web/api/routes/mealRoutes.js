const express = require('express');
const router = express.Router();
const mealController = require('../controllers/mealController');

// Define the POST route for filtering
router.post('/filter', mealController.getFilteredMeals);

module.exports = router;