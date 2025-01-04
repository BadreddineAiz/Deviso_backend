import User from '../model/userModel.js';
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

        res.status(200).json({
            status: 'success',
            data: user.suggestionsList,
        });
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

        if (user.suggestionsList.length >= 500) {
            return next(
                new AppError('Maximum of 150 suggestions allowed', 400)
            );
        }

        user.suggestionsList.push(suggestion);
        await user.save({ validateBeforeSave: false });

        res.status(201).json({
            status: 'success',
            data: user.suggestionsList,
        });
    } catch (err) {
        next(err);
    }
};
