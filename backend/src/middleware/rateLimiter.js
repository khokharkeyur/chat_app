import rateLimit from "express-rate-limit";

// Rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message:
    "Too many authentication attempts, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    // Use IP address or user identifier as key
    return req.ip || req.connection.remoteAddress;
  },
  skip: (req, res) => {
    // Skip rate limiting for non-auth endpoints
    return false;
  },
});

// Rate limiter for OTP endpoints (stricter)
export const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 OTP requests per hour
  message: "Too many OTP requests, please try again after 1 hour",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    return req.ip || req.connection.remoteAddress;
  },
});
