import { Router } from 'express';
import {
    getSuggestions,
    addSuggestion,
} from '../controller/suggestionsController.js';

const router = Router();

router.get('/', getSuggestions); // Get all suggestions
router.post('/', addSuggestion); // Add a new suggestion

export default router;
