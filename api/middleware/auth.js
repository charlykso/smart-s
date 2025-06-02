const jwt = require('jsonwebtoken');
const User = require('../model/User');

// Authenticate token middleware
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token is required'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).populate('school');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token - user not found'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Token verification failed',
            error: error.message
        });
    }
};

// Authorize roles middleware
const authorizeRoles = (allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }

            const userRoles = req.user.roles || [];
            const hasPermission = allowedRoles.some(role => userRoles.includes(role));

            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions',
                    required: allowedRoles,
                    current: userRoles
                });
            }

            next();
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Authorization failed',
                error: error.message
            });
        }
    };
};

// Check if user has specific role
const hasRole = (user, role) => {
    return user && user.roles && user.roles.includes(role);
};

// Check if user has any of the specified roles
const hasAnyRole = (user, roles) => {
    return user && user.roles && roles.some(role => user.roles.includes(role));
};

// Check if user has all of the specified roles
const hasAllRoles = (user, roles) => {
    return user && user.roles && roles.every(role => user.roles.includes(role));
};

// Middleware to check if user belongs to specific school
const checkSchoolAccess = (req, res, next) => {
    try {
        const { school_id } = req.params;
        const userSchool = req.user.school?._id || req.user.school;

        // Admin and ICT_administrator can access all schools
        if (hasAnyRole(req.user, ['Admin', 'ICT_administrator'])) {
            return next();
        }

        // Check if user belongs to the requested school
        if (school_id && userSchool.toString() !== school_id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied - school mismatch'
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'School access check failed',
            error: error.message
        });
    }
};

// Middleware to validate user status
const validateUserStatus = (req, res, next) => {
    try {
        if (!req.user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'User status validation failed',
            error: error.message
        });
    }
};

// Middleware to log user actions
const logUserAction = (action) => {
    return (req, res, next) => {
        try {
            console.log(`User Action: ${req.user.email} performed ${action} at ${new Date().toISOString()}`);
            next();
        } catch (error) {
            console.error('Action logging failed:', error);
            next(); // Continue even if logging fails
        }
    };
};

module.exports = {
    authenticateToken,
    authorizeRoles,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    checkSchoolAccess,
    validateUserStatus,
    logUserAction
};
