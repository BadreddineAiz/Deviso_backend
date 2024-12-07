import fs from 'fs';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import AppError from '../utils/appError.js';

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

export const uploadProductImage = upload.single('image');

export const resizeProductImage = async (req, res, next) => {
    if (!req.file) return next();

    try {
        // Define the output filename
        const outputPath = path.join(
            'public',
            req.user.id.toString(),
            'images',
            'products',
            `product-${Date.now()}.jpeg`
        );
        req.file.filePath = path.join(
            req.user.id.toString(),
            'images',
            'products',
            `product-${Date.now()}.jpeg`
        );
        // Ensure the directory exists
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });

        // Process and overwrite the image
        await sharp(req.file.buffer)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(outputPath);

        next();
    } catch (err) {
        console.error('Error processing image:', err);
        next(new AppError('Failed to process image', 500));
    }
};
