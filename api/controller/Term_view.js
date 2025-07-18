const Term = require('../model/Term')
const Session = require('../model/Session')
const School = require('../model/School')

exports.getAllTerms = async (req, res) => {
  try {
    console.log('getAllTerms debug:', {
      userEmail: req.user?.email,
      userRoles: req.user?.roles,
      schoolFilter: req.schoolFilter,
    })

    // For terms, we need to filter by the session's school since terms reference sessions
    if (req.schoolFilter && req.schoolFilter.school) {
      console.log('Filtering terms by school:', req.schoolFilter.school)

      // For school-restricted users, we need to populate and filter by session's school
      const terms = await Term.find().populate({
        path: 'session',
        select: 'name startDate endDate school',
        match: { school: req.schoolFilter.school }, // Filter sessions by school
        populate: {
          path: 'school',
          select: 'name email phoneNumber',
        },
      })

      console.log('Terms before filtering:', terms.length)
      console.log(
        'Terms with sessions:',
        terms.map((t) => ({
          termName: t.name,
          sessionName: t.session?.name,
          schoolName: t.session?.school?.name,
        }))
      )

      // Filter out terms where session is null (doesn't belong to user's school)
      const filteredTerms = terms.filter((term) => term.session !== null)
      console.log('Terms after filtering:', filteredTerms.length)

      res.status(200).json(filteredTerms)
    } else {
      console.log('No school filter - returning all terms')

      // General Admin can see all terms
      const terms = await Term.find().populate({
        path: 'session',
        select: 'name startDate endDate school',
        populate: {
          path: 'school',
          select: 'name email phoneNumber',
        },
      })

      console.log('All terms returned:', terms.length)
      res.status(200).json(terms)
    }
  } catch (error) {
    console.error('getAllTerms error:', error)
    res.status(500).json({ message: error.message })
  }
}

exports.getTermById = async (req, res) => {
  try {
    const term = await Term.findById(req.params.id).populate({
      path: 'session',
      select: 'name startDate endDate school',
      populate: {
        path: 'school',
        select: 'name email phoneNumber',
      },
    })
    if (!term) return res.status(404).json({ message: 'Term not found' })
    res.status(200).json(term)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getTermsBySessionAndSchool = async (req, res) => {
  try {
    const { school_id, session_id } = req.params

    const school = await School.findById(school_id)
    if (!school) return res.status(404).json({ message: 'School not found' })

    const session = await Session.findById(session_id)
    if (!session) return res.status(404).json({ message: 'Session not found' })

    const terms = await Term.find({
      session: session_id,
      school: school_id,
    }).populate('session')

    res.status(200).json(terms)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
exports.createTerm = async (req, res) => {
  try {
    const { session: session_id, name, startDate, endDate } = req.body

    // Find the session and populate school
    const session = await Session.findById(session_id).populate('school')
    if (!session) return res.status(409).json({ message: 'Session not found' })

    // Check if user has access to this session's school
    const userSchool = req.user.school?._id || req.user.school
    const isGeneralAdmin = req.user.roles.includes('Admin') && !userSchool

    if (!isGeneralAdmin) {
      const sessionSchoolId = session.school?._id || session.school
      if (userSchool.toString() !== sessionSchoolId.toString()) {
        return res.status(403).json({
          message: 'Not authorized to create terms for this session',
        })
      }
    }

    const existingTerm = await Term.findOne({ name, session: session_id })
    if (existingTerm) {
      return res.status(400).json({ message: 'Term already exists' })
    }

    const term = new Term({ session: session_id, name, startDate, endDate })
    await term.save()

    // Populate the response
    const populatedTerm = await Term.findById(term._id).populate({
      path: 'session',
      select: 'name startDate endDate school',
      populate: {
        path: 'school',
        select: 'name email phoneNumber',
      },
    })

    res.status(201).json(populatedTerm)
  } catch (error) {
    console.error('createTerm error:', error)
    res.status(400).json({ message: error.message })
  }
}

exports.updateTerm = async (req, res) => {
  try {
    const { name, startDate, endDate } = req.body

    // Find the term and populate session and school
    const term = await Term.findById(req.params.id).populate({
      path: 'session',
      populate: {
        path: 'school',
      },
    })

    if (!term) return res.status(404).json({ message: 'Term not found' })

    // Check if user has access to this term's school
    const userSchool = req.user.school?._id || req.user.school
    const isGeneralAdmin = req.user.roles.includes('Admin') && !userSchool

    if (!isGeneralAdmin) {
      const termSchoolId = term.session?.school?._id || term.session?.school
      if (userSchool.toString() !== termSchoolId.toString()) {
        return res.status(403).json({
          message: 'Not authorized to update this term',
        })
      }
    }

    // Update the term
    term.name = name
    term.startDate = startDate
    term.endDate = endDate
    await term.save()

    // Return populated term
    const updatedTerm = await Term.findById(term._id).populate({
      path: 'session',
      select: 'name startDate endDate school',
      populate: {
        path: 'school',
        select: 'name email phoneNumber',
      },
    })

    res.status(200).json(updatedTerm)
  } catch (error) {
    console.error('updateTerm error:', error)
    res.status(500).json({ message: error.message })
  }
}

exports.deleteTerm = async (req, res) => {
  try {
    // Find the term and populate session and school
    const term = await Term.findById(req.params.id).populate({
      path: 'session',
      populate: {
        path: 'school',
      },
    })

    if (!term) return res.status(404).json({ message: 'Term not found' })

    // Check if user has access to this term's school
    const userSchool = req.user.school?._id || req.user.school
    const isGeneralAdmin = req.user.roles.includes('Admin') && !userSchool

    if (!isGeneralAdmin) {
      const termSchoolId = term.session?.school?._id || term.session?.school
      if (userSchool.toString() !== termSchoolId.toString()) {
        return res.status(403).json({
          message: 'Not authorized to delete this term',
        })
      }
    }

    // Delete the term
    await Term.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: 'Term deleted successfully' })
  } catch (error) {
    console.error('deleteTerm error:', error)
    res.status(500).json({ message: error.message })
  }
}

exports.getTermBySession = async (req, res) => {
  try {
    const { session } = req.params
    const term = await Term.find({ session: session }).populate('session')
    res.json(term)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
