const express = require('express');
const { signup, login, getMe, changePassword, forgotPassword, resetPassword } = require('./auth.controller');
const router = express.Router();

router.post('/signup',           signup);
router.post('/login',            login);
router.get('/me',                getMe);
router.post('/change-password',  changePassword);
router.post('/forgot-password',  forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
