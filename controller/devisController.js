import asyncHandler from 'express-async-handler';
import { launch } from 'puppeteer';
import { promises as fs } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import path from 'path';
import { getDocument } from './handlerFactory.js';
import Devis from '../model/devisModel.js';
import {
    FactureDevisFooterTemplate,
    FactureDevisTemplate,
} from '../templates/Templates.js';
import { format } from 'date-fns';
import { fetchImageAsBase64, filterObj } from '../utils/helpers.js';
import Product from '../model/ProductModel.js';
import Client from '../model/clientModel.js';
import multer from 'multer';
import AppError from '../utils/appError.js';
import ApiFeatures from '../utils/apiFeatures.js';
import { UserFilter } from '../data/FeaturesList.js';

const multerStorage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const userFolder = path.join(
            'public',
            req.user.id.toString(),
            'bonCommands'
        );

        // Create user-specific folder if it doesn't exist
        try {
            await fs.mkdir(userFolder, { recursive: true }); // Async/await for clarity
            console.log('Folder created:', userFolder);
            cb(null, userFolder);
        } catch (err) {
            console.error('Error creating directory:', err);
            cb(new Error('Failed to create folder'));
        }
    },
    filename: (req, file, cb) => {
        const filename = `bonCommand-${req.user.id}-${Date.now()}.pdf`;
        file.fullPath = path.join(
            req.user.id.toString(),
            'bonCommands',
            filename
        );
        console.log('File path set:', file.fullPath);
        cb(null, filename);
    },
});

const multerFilter = (req, file, cb) => {
    if (file.mimetype.split('/')[1] == 'pdf') {
        cb(null, true);
    } else {
        cb(new AppError('Not a PDF File! Please upload only PDF', 500), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
});

export const uploadBonCommand = upload.single('bonCommand');

export const getDevis = getDocument(Devis, UserFilter);
export const getDeviss = asyncHandler(async (req, res) => {
    const filter = { user: req.user.id, active: true };
    req.query.sort = '-createdAt';
    const features = new ApiFeatures(
        Devis.find(filter).populate('client'),
        req.query
    )
        .filter()
        .sort()
        .limitFields()
        .paginate();
    // Execution
    const documents = await features.query;
    const totalItems = await Devis.countDocuments(filter);
    res.status(200).json({
        status: 'success',
        totalItems,
        results: documents.length,
        data: documents,
    });
});

export const createDevis = asyncHandler(async (req, res, next) => {
    if (!req.body) {
        return res.status(400).json({
            status: 'fail',
            message: 'Please enter Devis Data',
        });
    }

    const client = await Client.findOne({
        user: req.user.id,
        _id: req.body.client,
    });

    if (!client) {
        return next(new AppError('Client Not Found', 404));
    }

    if (req.file) req.body.bonCommand = req.file.fullPath;

    const articlesProducts = req.body.articles.filter(
        (artc) => artc.type == 'product'
    );

    articlesProducts.forEach(async (article) => {
        const product = await Product.findOne({
            user: req.user.id,
            _id: article.productID,
        });
        if (!product) {
            return next(new AppError('Product Not Found', 404));
        }
        if (article.quantity > product.quantity) {
            return next(
                new AppError(
                    `Product ${product.designation} Quantity Only ${product.quantity} and You are asking for ${article.quantity}`,
                    404
                )
            );
        }
    });

    const devis = await Devis.create({ ...req.body, user: req.user.id });

    res.status(200).json({
        status: 'success',
        data: devis,
    });
});

export const updateDevis = asyncHandler(async (req, res, next) => {
    const filter = { user: req.user.id };
    if (!req.body.articles) req.body.articles = [];
    const filtredBody = filterObj(
        req.body,
        'object',
        'articles',
        'numeroBonCommand'
    );

    if (req.file) filtredBody.bonCommand = req.file.fullPath;

    const articlesProducts = req.body.articles.filter(
        (artc) => artc.type == 'product'
    );

    articlesProducts.forEach(async (article) => {
        const product = await Product.findOne({
            user: req.user.id,
            _id: article.productID,
        });
        if (!product) {
            return next(new AppError('Product Not Found', 404));
        }
        if (article.quantity > product.quantity) {
            return next(
                new AppError(
                    `Product Quantity Only ${product.quantity} and You ask for ${article.quantity}`,
                    404
                )
            );
        }
    });

    const devis = await Devis.findOneAndUpdate(
        {
            _id: req.params.documentID,
            facture: null,
            ...filter,
        },
        filtredBody,
        { new: true, runValidators: true }
    );

    if (!devis) {
        return next(
            new AppError(
                'Devis Not Found or Has been already transformed to Facture',
                404
            )
        );
    }

    res.status(200).json({
        status: 'success',
        data: devis,
    });
});

export const deleteDevis = asyncHandler(async (req, res, next) => {
    const filter = { user: req.user.id, facture: null };
    const document = await Devis.findOneAndUpdate(
        {
            _id: req.params.documentID,
            ...filter,
        },
        { active: false },
        { new: true } // Return the updated document
    );
    if (!document) {
        return next(new AppError('Document Not Found', 404));
    }
    res.status(200).json({
        status: 'success',
        data: null,
    });
});

export const exportDevis = asyncHandler(async (req, res, next) => {
    const devis = await Devis.findOne({
        user: req.user.id,
        _id: req.params.documentID,
    })
        .populate('user')
        .populate('client');

    if (!devis) {
        return next(new AppError('Devis Not Found', 404));
    }

    const user = devis.user;
    const client = devis.client;

    const docType = 'Devis';
    const mainColor = user.mainColor;
    const secondColor = user.secondColor;
    const PORT = process.env.PORT || 5000;
    const logo = await fetchImageAsBase64(
        `${req.protocol}://${req.hostname}:${PORT}/images/users/${user.logo}`
    );
    const clientName = client.name;
    const clientTel = client.tel;
    const clientICE = client.ice;
    const clientAddress = client.address;
    const userName = user.name;
    const userEmail = user.email;
    const date = format(devis.createdAt, 'dd/MM/yyyy');
    const docNumber = `DEV-${devis.createdAt.getFullYear()}-${devis.numero}`;
    const articles = devis.articles;
    const userICE = user.ice;
    const userIF = user.if;
    const userPatente = user.patente;
    const userRC = user.rc;
    const userCNSS = user.cnss;
    const userRib = user.rib;
    const userTel = user.tel;
    const userAddress = user.address;
    const object = devis.object;

    const htmlContent = FactureDevisTemplate({
        docType,
        object,
        mainColor,
        secondColor,
        logo,
        date,
        clientName,
        clientTel,
        clientICE,
        clientAddress,
        userName,
        userEmail,
        docNumber,
        articles,
        userICE,
        userIF,
        userPatente,
        userRC,
        userCNSS,
        userRib,
        userTel,
        userAddress,
    });

    // Launch Puppeteer and generate PDF
    const browser = await launch({
        headless: true, // Ensure headless mode is enabled
        args: ['--no-sandbox', '--disable-setuid-sandbox'], // Add these flags
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent);

    // Path where the PDF will be saved
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const tempFilePath = join(
        __dirname,
        `../temp/devis_${user._id}_${docNumber}.pdf`
    );

    // Generate the PDF
    await page.pdf({
        path: tempFilePath,
        format: 'A4',
        printBackground: true,
        displayHeaderFooter: true,
        footerTemplate: FactureDevisFooterTemplate(docType, docNumber),
    });

    await browser.close();

    // Send the PDF as a response
    res.contentType('application/pdf');
    res.sendFile(tempFilePath, async (err) => {
        if (err) {
            return res.status(500).json({
                status: 'fail',
                message: 'Error sending file',
            });
        }
        await fs.unlink(tempFilePath); // Cleanup the temporary file
    });
});
