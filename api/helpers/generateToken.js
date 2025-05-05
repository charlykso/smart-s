const jwt = require('jsonwebtoken');
const { admin, User } = require('./roleList');
require('dotenv').config();

const getAuthToken = (User) => {
    if (!User || !User._id || !User.role) {
        throw new Error("Invalid user data");
    }

    return jwt.sign(
        {
            id: User._id,
            roles: [User.role],
            iat: Math.floor(Date.now() / 1000), 
            iss: "annunciation group school", 
            aud: "User", 
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
            id: User._id,
            role: User.role,
            iat: Math.floor(Date.now() / 1000),
            iss: "annunciation group schoool",
            aud: "User",
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
