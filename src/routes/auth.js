const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
const { authRateLimiter } = require('../middleware/rateLimiter');

router.post('/signup', authRateLimiter, controller.signup);
router.post('/login', authRateLimiter, controller.login);
router.get('/verify-email', controller.verifyEmail);
router.post('/refresh', controller.refreshToken);
router.post('/logout', controller.logout);
router.post('/request-password-reset', authRateLimiter, controller.requestPasswordReset);
router.post('/reset-password', controller.resetPassword);

module.exports = router;