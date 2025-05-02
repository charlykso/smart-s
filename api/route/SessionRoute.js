const express = require('express');
const router = express.Router();
const sessionController = require('../controller/session_view');

router.get('/all', sessionController.getAllSessions);
router.get('/:id', sessionController.getSessionById);
router.post('/create', sessionController.createSession);
router.put('/:id/update', sessionController.updateSession);
router.delete('/:id/delete', sessionController.deleteSession);

module.exports = router;
