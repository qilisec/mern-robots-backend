const express = require('express');

const {
  createRobot,
  updateRobot,
  deleteRobot,
  getRobotById,
  getAllRobots,
} = require('../controllers/robotController');

const router = express.Router();

router.post('/robot', createRobot);
router.put('/robot/:id', updateRobot);
router.delete('/robot/:id', deleteRobot);
router.get('/robot/:id', getRobotById);
router.get('/getrobotlist', getAllRobots);

module.exports = router;
