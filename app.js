import express, { json, urlencoded } from "express";
import cors from "cors";
import { connect } from "mongoose";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import userRouter from "./routes/userRouter.js";
import clientRouter from "./routes/ClientRouter.js";
import factureRouter from "./routes/FactureRouter.js";
import devisRouter from "./routes/DevisRouter.js";
import errorHandler from "./middlewares/errorMiddleware.js";
import AppError from "./utils/appError.js";

dotenv.config({ path: "./config.env" });

const PORT = process.env.PORT || 5000;
const app = express();

connect(process.env.MONGO_URI)
  .then((response) => {
    console.log(`MongDB Connected : ${response.connection.host}`);
  })
  .catch((error) => {
    console.log("Error in DB connection: " + error);
  });
//Security
app.use(helmet()); // HTTP Headers Security

app.use(
  "/api",
  rateLimit({
    max: 100, // allow 100 request
    windowMs: 60 * 60 * 1000, // in one hour
    message: "To many request from this IP, please try again in one hour!",
  })
);
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

//Body Parser
app.use(
  json({
    limit: "10kb", // Limit the amount of data sent to client
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

app.use(express.static("./public"));
app.use("/users", userRouter);
app.use("/devis", devisRouter);
app.use("/facture", factureRouter);
app.use("/client", clientRouter);

app.all("*", (req, res, next) => {
  next(new AppError("This Route is not defined", 404));
});

// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(err.status || 500).json({
//     message: err.message,
//     // Optional: send the stack trace only in development mode
//     stack: process.env.NODE_ENV === "development" ? err.stack : {},
//   });
// });

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`server started in port  ${PORT}`);
});
