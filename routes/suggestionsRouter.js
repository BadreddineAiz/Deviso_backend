import { Router } from 'express';
import {
    getSuggestions,
    addSuggestion,
    updateSuggestion,
    deleteSuggestion,
} from '../controller/suggestionsController.js';

const router = Router();

router.get('/', getSuggestions); // Get all suggestions
router.post('/', addSuggestion); // Add a new suggestion
router.put('/:index', updateSuggestion); // Update a suggestion
router.delete('/:index', deleteSuggestion); // Delete a suggestion

export default router;
