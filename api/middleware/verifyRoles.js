const verifyRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req?.user?.roles) {
      console.log('VerifyRoles debug - No user roles found')
      return res.status(401).json({
        success: false,
        message: 'User roles not found',
      })
    }

    const rolesArray = [...allowedRoles]
    console.log('VerifyRoles debug - Allowed roles:', rolesArray)
    console.log('VerifyRoles debug - User roles:', req.user.roles)

    const result = req.user.roles
      .map((role) => rolesArray.includes(role))
      .find((val) => val === true)

    if (!result) {
      console.log(
        'VerifyRoles debug - Access denied - user roles do not match allowed roles'
      )
      return res.status(401).json({
        success: false,
        message: 'Insufficient permissions',
      })
    }

    console.log('VerifyRoles debug - Access granted')
    next()
  }
}

module.exports = verifyRoles
