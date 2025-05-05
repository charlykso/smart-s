const jwt = require('jsonwebtoken')
const User = require('../model/User')
require('dotenv').config()

const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;
    const refreshToken = cookies?.refreshToken
    if (!refreshToken) return res.sendStatus(401)
    
    jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET,
        async (err, decoded) => {
            if (err) return res.sendStatus(403)
            const user = await User.findById(decoded.id).exec()
            if (!user) return res.sendStatus(403)

            const newAccessToken = jwt.sign(
                { id: user._id, roles: [user.role] },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            )
            res.json({ token: newAccessToken })
        }
    )
}

module.exports = { handleRefreshToken }