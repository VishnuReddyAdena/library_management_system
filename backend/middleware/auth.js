const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Missing Authorization Header",
      code: "INVALID_CREDENTIALS"
    });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Missing Authorization Token",
      code: "INVALID_CREDENTIALS"
    });
  }

  const secret = process.env.JWT_SECRET_KEY || 'jwt-secret-key-12345';

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // Contains id (identity) and role
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: "Token has expired",
        code: "TOKEN_EXPIRED"
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid Token",
      code: "INVALID_CREDENTIALS"
    });
  }
};

module.exports = authMiddleware;
