const express = require('express');
const router = express.Router();
const ingredientController = require('../controllers/ingredientController');

router.post('/toggle', ingredientController.toggleIngredient); 

module.exports = router;