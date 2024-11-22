import User from '../model/userModel.js';
import asyncHandler from 'express-async-handler';
import { getDocument, getDocuments } from './handlerFactory.js';
import { filterObj } from '../utils/helpers.js';
import multer from 'multer';
import sharp from 'sharp';
import AppError from '../utils/appError.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image! Please upload only images', 500), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
    limits: { fileSize: 3 * 1024 * 1024 },
});

export const uploadUserLogo = upload.single('logo');

export const resizeUserLogo = async (req, res, next) => {
    if (!req.file) return next();
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    try {
        // Define the output filename
        req.file.filename = `userLogo-${req.user.id}.jpeg`;
        const outputPath = path.join(
            __dirname,
            '../public/images/users',
            req.file.filename
        );

        // Ensure the directory exists
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });

        // Process and overwrite the image
        await sharp(req.file.buffer)
            // .resize(500, 500)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(outputPath);

        next();
    } catch (err) {
        console.error('Error processing image:', err);
        new AppError('Failed to process image', 500);
    }
};

export const getUsers = getDocuments(User);

export const getUser = getDocument(User);

export const getMe = asyncHandler(async (req, res) => {
    const document = await User.findById(req.user.id);
    if (!document) {
        return res.status(404).json({
            status: 'fail',
            message: 'Document Not Found',
        });
    }
    res.status(200).json({
        status: 'success',
        data: document,
    });
});

export const updateMe = asyncHandler(async (req, res) => {
    if (req.body.password || req.body.passwordConfirm) {
        return res.status(400).json({
            status: 'fail',
            message:
                'This route is not for password updates. Please use /updateMyPassword',
        });
    }

    const filteredBody = filterObj(
        req.body,
        'name',
        'email',
        'ice',
        'if',
        'patente',
        'rc',
        'cnss',
        'rib',
        'tel',
        'address',
        'mainColor',
        'secondColor',
        'logo'
    );
    if (req.file) filteredBody.logo = req.file.filename;

    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        filteredBody,
        {
            new: true,
            runValidators: true,
        }
    );

    if (!updatedUser) {
        return res.status(404).json({
            status: 'fail',
            message: 'User Not Found',
        });
    }

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser,
        },
    });
});

export const deleteMe = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: 'success',
        data: null,
    });
});
