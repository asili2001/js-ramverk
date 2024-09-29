import express from 'express';
import AuthController from '../controllers/user.controller.js';
import AuthValidator from '../middlewares/validators/auth.validator.js';
import AuthMiddleware from '../middlewares/checkAuth.js';

const router = express.Router();

const authController = new AuthController();
const authValidator = new AuthValidator();
const authMiddleware = new AuthMiddleware();

router.post('/', authValidator.newUser, authController.newUser);
router.post('/activate', authValidator.activateAccount, authController.activateAccount);
router.post('/login', authValidator.loginUser, authController.loginUser);
router.post('/validate', authMiddleware.checkUser, authController.validate);

export default router;
