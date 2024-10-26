import { Router } from 'express';

import {
    signUp,
    login,
    forgotPassword,
    resetPassword,
    protect,
    logout,
    refreshToken,
    updatePassword,
} from '../controller/authController.js';

const router = Router();

router.post('/signup', signUp);

router.post('/login', login);

router.post('/forgotpassword', forgotPassword);

router.patch('/resetpassword/:token', resetPassword);

router.post('/refresh-token', refreshToken);

// Protecting all these routes for logged-in users
router.use(protect);

router.post('/logout', logout);

router.patch('/updateMyPassword', updatePassword);

export default router;
