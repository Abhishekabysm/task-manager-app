const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token'); // Common header name for JWT

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Verify token
  try {
    // Decode token using the secret from .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user from payload to request object
    // The payload structure depends on how it was created in generateToken
    if (decoded.user && decoded.user.id) {
        req.user = decoded.user; // Attach the user payload { id: userId }
        next(); // Proceed to the next middleware or route handler
    } else {
        console.error("Token payload structure is invalid:", decoded);
        return res.status(401).json({ message: 'Token is not valid (invalid payload structure)' });
    }

  } catch (err) {
    console.error('Token verification error:', err.message);
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Token is not valid' });
    } else if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token has expired' });
    } else {
        return res.status(500).json({ message: 'Server error during token verification' });
    }
  }
};
