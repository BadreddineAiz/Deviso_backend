const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
require("dotenv").config({ path: "./config.env" });

const userRouter = require("./routes/userRouter.js");
const clientRouter = require("./routes/ClientRouter.js");
const factureRouter = require("./routes/FactureRouter.js");
const devisRouter = require("./routes/DevisRouter.js");

const PORT = process.env.PORT || 5000;
const app = express();

mongoose
  .connect(process.env.MONGO_URI)
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
//Body Parser
app.use(cors());
app.use(
  express.json({
    limit: "10kb", // Limit the amount of data sent to client
  })
);

//Data Sanitization against NoSQL query injection
app.use(mongoSanitize());
// Data Sanitization against XSS
app.use(xss());
// Prevent Parameter pollution
app.use(hpp());

app.use(express.urlencoded({ extended: false }));

app.use(express.static("./public"));
app.get("/", (req, res) => {
  res.send("Hello this is Deviso");
});
app.use("/users", userRouter);
app.use("/devis", devisRouter);
app.use("/facture", factureRouter);
app.use("/client", clientRouter);

app.all("*", (req, res, next) => {
  next(new Error("This Route is not defined"));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message,
    // Optional: send the stack trace only in development mode
    stack: process.env.NODE_ENV === "development" ? err.stack : {},
  });
});

app.listen(PORT, () => {
  console.log(`server started in port  ${PORT}`);
});
