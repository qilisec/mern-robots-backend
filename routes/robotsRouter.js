const express = require('express');

const {
  createRobot,
  updateRobot,
  deleteRobot,
  // deleteAllSeedRobots,
  getRobotById,
  // getAllRobots,
} = require('../controllers/robotController');
const {
  deleteAllSeedRobots,
  getAllRobots,
} = require('../controllers/reseedRobots');

const router = express.Router();

router.post('/robot', createRobot);
router.put('/robot/:id', updateRobot);
router.get('/robot/:id', getRobotById);
router.delete('/robot/:id', deleteRobot);
router.delete('/robot', deleteAllSeedRobots);
router.get('/getrobotlist', getAllRobots);

module.exports = router;
