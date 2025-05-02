const express = require('express');
const router = express.Router();
const classArmController = require('../controller/classArm_view');

router.get('/all', classArmController.getAllClassArms);
router.get('/:id', classArmController.getClassArmById);
router.post('/', classArmController.createClassArm);
router.put('/:id/update', classArmController.updateClassArm);
router.delete('/:id/delete', classArmController.deleteClassArm);

module.exports = router;
