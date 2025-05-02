const express = require('express');
const router = express.Router();
const termController = require('../controller/term_view');

router.get('/all', termController.getAllTerms);
router.get('/:id', termController.getTermById);
router.post('/create', termController.createTerm);
router.put('/:id/update', termController.updateTerm);
router.delete('/:id/delete', termController.deleteTerm);

module.exports = router;
