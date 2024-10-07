const express = require('express');
const AuthController = require('../controllers/user.controller.js');
const AuthValidator = require('../middlewares/validators/auth.validator.js');


const router = express.Router();

const authController = new AuthController();
const authValidator = new AuthValidator();

router.post('/', authValidator.newUser, authController.newUser);
router.post('/activate', authValidator.activateAccount, authController.activateAccount);
router.post('/login', authValidator.loginUser, authController.loginUser);
router.post('/validate', authValidator.validateToken, authController.validateToken);

module.exports = router;
