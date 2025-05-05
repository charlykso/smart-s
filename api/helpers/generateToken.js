const jwt = require('jsonwebtoken');
require('dotenv').config();

const getAuthToken = (User) => {
    if (!user || !user._id || !user.roles) {
        throw new Error("Invalid user data");
    }

    return jwt.sign(
        {
            id: user._id,
            roles: [user.roles],
            iat: Math.floor(Date.now() / 1000), 
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '1h',
        }
    );
};

const getRefreshToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            roles: user.role,
            iat: Math.floor(Date.now() / 1000),
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: '5d',
        }
    );
};

const generateToken = (user) => {
    const authToken = getAuthToken(user);
    const refreshToken = getRefreshToken(user);
    return { authToken, refreshToken };
};

module.exports = generateToken;
