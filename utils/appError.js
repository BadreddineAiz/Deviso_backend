// utils/appError.js

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Indicates if the error is operational or programmer error

    Error.captureStackTrace(this, this.constructor); // Capture stack trace excluding this constructor call
  }
}

export default AppError;
