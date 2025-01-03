import User from '../models/userModel.js';
import AppError from '../utils/appError.js';

/**
 * Get all suggestions for the logged-in user.
 */
export const getSuggestions = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('suggestionsList');
        if (!user) {
            return next(new AppError('User not found', 404));
        }

        res.status(200).json(user.suggestionsList);
    } catch (err) {
        next(err);
    }
};

/**
 * Add a new suggestion to the logged-in user's list.
 */
export const addSuggestion = async (req, res, next) => {
    try {
        const { suggestion } = req.body;

        if (!suggestion || suggestion.trim() === '') {
            return next(new AppError('Suggestion cannot be empty', 400));
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return next(new AppError('User not found', 404));
        }

        if (user.suggestionsList.length >= 150) {
            return next(
                new AppError('Maximum of 150 suggestions allowed', 400)
            );
        }

        user.suggestionsList.push(suggestion);
        await user.save();

        res.status(201).json(user.suggestionsList);
    } catch (err) {
        next(err);
    }
};

/**
 * Update a specific suggestion by its index.
 */
export const updateSuggestion = async (req, res, next) => {
    try {
        const { index } = req.params;
        const { suggestion } = req.body;

        if (!suggestion || suggestion.trim() === '') {
            return next(new AppError('Suggestion cannot be empty', 400));
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return next(new AppError('User not found', 404));
        }

        const suggestionIndex = parseInt(index, 10);
        if (
            isNaN(suggestionIndex) ||
            suggestionIndex < 0 ||
            suggestionIndex >= user.suggestionsList.length
        ) {
            return next(new AppError('Invalid suggestion index', 400));
        }

        user.suggestionsList[suggestionIndex] = suggestion;
        await user.save();

        res.status(200).json(user.suggestionsList);
    } catch (err) {
        next(err);
    }
};

/**
 * Delete a specific suggestion by its index.
 */
export const deleteSuggestion = async (req, res, next) => {
    try {
        const { index } = req.params;

        const user = await User.findById(req.user.id);
        if (!user) {
            return next(new AppError('User not found', 404));
        }

        const suggestionIndex = parseInt(index, 10);
        if (
            isNaN(suggestionIndex) ||
            suggestionIndex < 0 ||
            suggestionIndex >= user.suggestionsList.length
        ) {
            return next(new AppError('Invalid suggestion index', 400));
        }

        user.suggestionsList.splice(suggestionIndex, 1);
        await user.save();

        res.status(200).json(user.suggestionsList);
    } catch (err) {
        next(err);
    }
};
