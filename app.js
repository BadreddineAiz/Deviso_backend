import express, { json, urlencoded } from 'express';
import cors from 'cors';
import { connect } from 'mongoose';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import authRouter from './routes/authRouter.js';
import userRouter from './routes/userRouter.js';
import clientRouter from './routes/ClientRouter.js';
import factureRouter from './routes/FactureRouter.js';
import devisRouter from './routes/DevisRouter.js';
import dashboardRouter from './routes/DashboardRouter.js';
import errorHandler from './middlewares/errorMiddleware.js';
import AppError from './utils/appError.js';

dotenv.config({ path: './config.env' });

const PORT = process.env.PORT || 5000;
const app = express();

connect(process.env.MONGO_URI)
    .then((response) => {
        console.log(`MongoDB Connected : ${response.connection.host}`);
    })
    .catch((error) => {
        console.log('Error in DB connection: ' + error);
    });

// Security Middleware
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// Rate Limiters
const whitelist = []; // Define whitelisted IPs here

const generalApiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    message: { status: 429, error: 'Too many requests from this IP, please try again later.' },
    headers: true,
});

const intensiveLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    message: { status: 429, error: 'Too many requests for this operation, please slow down.' },
    headers: true,
    skip: (req) => whitelist.includes(req.ip),
});

const authLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { status: 429, error: 'Too many login attempts, please try again after a minute.' },
    headers: true,
});

// Apply Rate Limiters
app.use(generalApiLimiter); // Apply to all general routes
app.use('/api/auth', authLimiter); // Apply specifically for auth routes
app.use('/api/:documentID/export', intensiveLimiter); // Apply to intensive routes

// Parsing Middleware
app.use(json({ limit: '10kb' }));
app.use(cookieParser());
app.use(urlencoded({ extended: false }));

// Static Files
app.use(express.static('./public'));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/devis', devisRouter);
app.use('/api/facture', factureRouter);
app.use('/api/client', clientRouter);
app.use('/api/statistics', dashboardRouter);

// 404 Route Handling
app.all('*', (req, res, next) => {
    next(new AppError('This Route is not defined', 404));
});

// Error Handling Middleware
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
