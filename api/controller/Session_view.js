const Session = require('../model/Session')
const School = require('../model/School')
const Term = require('../model/Term')
exports.getAllSessions = async (req, res) => {
  try {
    // Use school filter from middleware (req.schoolFilter) if user is restricted to a school
    // Only general Admin (not assigned to a school) can see all sessions
    const filter = req.schoolFilter || {}

    console.log('getAllSessions debug:', {
      userEmail: req.user?.email,
      userRoles: req.user?.roles,
      schoolFilter: req.schoolFilter,
      filter,
    })

    const sessions = await Session.find(filter).populate(
      'school',
      'name email phoneNumber'
    )

    console.log('Sessions found:', sessions.length)
    console.log(
      'Session schools:',
      sessions.map((s) => ({
        sessionName: s.name,
        schoolName: s.school?.name,
        schoolId: s.school?._id,
      }))
    )

    res.status(200).json(sessions)
  } catch (error) {
    console.error('getAllSessions error:', error)
    res.status(500).json({ message: error.message })
  }
}

exports.getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).populate(
      'school',
      'name email phoneNumber'
    )
    if (!session) return res.status(404).json({ message: 'Session not found' })
    res.status(200).json(session)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.createSession = async (req, res) => {
  try {
    const { school_id, name, startDate, endDate } = req.body
    const school = await School.findById(school_id)
    if (!school) return res.status(404).json({ message: 'School not found' })
    const existingSession = await Session.findOne({ name, school: school_id })
    if (existingSession) {
      return res.status(400).json({ message: 'session already exists' })
    }
    const session = new Session({ school: school_id, name, startDate, endDate })
    await session.save()
    res.status(201).json(session)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

exports.updateSession = async (req, res) => {
  try {
    const { school_id, name, startDate, endDate } = req.body

    // Find the session and populate school
    const session = await Session.findById(req.params.id).populate('school')
    if (!session) return res.status(404).json({ message: 'Session not found' })

    // Check if user has access to this session's school
    const userSchool = req.user.school?._id || req.user.school
    const isGeneralAdmin = req.user.roles.includes('Admin') && !userSchool

    if (!isGeneralAdmin) {
      const sessionSchoolId = session.school?._id || session.school
      if (userSchool.toString() !== sessionSchoolId.toString()) {
        return res.status(403).json({
          message: 'Not authorized to update this session',
        })
      }
    }

    // Update the session
    session.school = school_id
    session.name = name
    session.startDate = startDate
    session.endDate = endDate
    await session.save()

    // Return populated session
    const updatedSession = await Session.findById(session._id).populate({
      path: 'school',
      select: 'name email phoneNumber',
    })

    res.status(200).json(updatedSession)
  } catch (error) {
    console.error('updateSession error:', error)
    res.status(500).json({ message: error.message })
  }
}
exports.getTermsBySession = async (req, res) => {
  try {
    const { school_id, session_id } = req.params

    const school = await School.findById(school_id)
    if (!school) return res.status(404).json({ message: 'School not found' })

    const session = await Session.findById(session_id)
    if (!session) return res.status(404).json({ message: 'Session not found' })

    const terms = await Term.find({ session: session_id, school: school_id })

    res.status(200).json(terms)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.deleteSession = async (req, res) => {
  try {
    // Find the session and populate school
    const session = await Session.findById(req.params.id).populate('school')
    if (!session) return res.status(404).json({ message: 'Session not found' })

    // Check if user has access to this session's school
    const userSchool = req.user.school?._id || req.user.school
    const isGeneralAdmin = req.user.roles.includes('Admin') && !userSchool

    if (!isGeneralAdmin) {
      const sessionSchoolId = session.school?._id || session.school
      if (userSchool.toString() !== sessionSchoolId.toString()) {
        return res.status(403).json({
          message: 'Not authorized to delete this session',
        })
      }
    }

    // Delete the session
    await Session.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: 'Session deleted successfully' })
  } catch (error) {
    console.error('deleteSession error:', error)
    res.status(500).json({ message: error.message })
  }
}
