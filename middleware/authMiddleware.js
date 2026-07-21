const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: "No token provided. Access denied."
            });
        }

        // Extract token (remove "Bearer " prefix)
        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Add userId to request (available in next route)
        req.userId = decoded.userId;

        // Continue to next function
        next();

    } catch (error) {
        console.log(error);  // helpful for debugging
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

module.exports = authMiddleware;