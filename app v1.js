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
        console.log(`MongDB Connected : ${response.connection.host}`);
    })
    .catch((error) => {
        console.log('Error in DB connection: ' + error);
    });
//Security
app.use(helmet()); // HTTP Headers Security

// Whitelist certain IPs (e.g., internal tools, trusted IPs)
const whitelist = [];

// General API rate limiter (e.g., 100 requests per minute)
const generalApiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        status: 429,
        error: 'Too many requests from this IP, please try again later.',
    },
    headers: true, // Add rate-limit headers to responses
});

// Intensive operation rate limiter (e.g., 20 requests per minute)
const intensiveLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // limit each IP to 20 requests per windowMs
    message: {
        status: 429,
        error: 'Too many requests for this operation, please slow down.',
    },
    headers: true,
    skip: (req) => whitelist.includes(req.ip), // Skip for whitelisted IPs
});

// Authentication limiter (e.g., 10 requests per minute)
const authLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // limit each IP to 10 login attempts per windowMs
    message: {
        status: 429,
        error: 'Too many login attempts, please try again after a minute.',
    },
    headers: true,
});

// Apply rate limiters
app.use('/', generalApiLimiter); // For general API usage
app.use('/:documentID/export(facture|bonLivraison|devis)', intensiveLimiter); // For intensive export operations
app.use('/auth', authLimiter); // For authentication routes

// Define the list of allowed origins

app.use(cors({ origin: true, credentials: true }));

//Body Parser
app.use(
    json({
        limit: '10kb', // Limit the amount of data sent to client
    })
);

//Data Sanitization against NoSQL query injection
app.use(mongoSanitize());
// Data Sanitization against XSS
app.use(xss());
// Prevent Parameter pollution
app.use(hpp());

app.use(cookieParser());
app.use(urlencoded({ extended: false }));

app.use(express.static('./public'));
app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/devis', devisRouter);
app.use('/facture', factureRouter);
app.use('/client', clientRouter);
app.use('/statistics', dashboardRouter);

app.all('*', (req, res, next) => {
    next(new AppError('This Route is not defined', 404));
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`server started in port  ${PORT}`);
});
