// middlewares/errorMiddleware.js

const errorHandler = (err, req, res, next) => {
  // Set default error values
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Log the error for debugging purposes
  var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  console.error(`ERROR 💥 from ${fullUrl}`, err);

  // Send error response to the client
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

export default errorHandler;
