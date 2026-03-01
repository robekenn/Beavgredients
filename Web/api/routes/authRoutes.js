const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// These will be prefixed by /api/auth in index.js
router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

module.exports = router;