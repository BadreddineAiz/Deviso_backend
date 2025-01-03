import { Router } from 'express';
import {
    updateMe,
    getMe,
    uploadUserLogo,
    resizeUserLogo,
} from '../controller/userController.js';

import { protect } from '../controller/authController.js';
import suggestionsRouter from './suggestionsRouter.js';

const router = Router();

// Protecting all these routes for logged-in users
router.use(protect);

router.get('/me', getMe);

router.patch('/updateMe', uploadUserLogo, resizeUserLogo, updateMe);

router.use('/suggestions', suggestionsRouter);

export default router;
