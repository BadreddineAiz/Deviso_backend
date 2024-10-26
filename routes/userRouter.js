import { Router } from 'express';
import {
    updateMe,
    getMe,
    uploadUserLogo,
    resizeUserLogo,
} from '../controller/userController.js';

import { protect } from '../controller/authController.js';

const router = Router();

// Protecting all these routes for logged-in users
router.use(protect);

router.get('/me', getMe);

router.patch('/updateMe', uploadUserLogo, resizeUserLogo, updateMe);

export default router;
