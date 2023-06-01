const express = require('express');

const {
  createRobot,
  sendCreateRobot,
  updateRobot,
  deleteRobot,
  // deleteAllSeedRobots,
  getRobotById,
  getAllRobots,
} = require('../controllers/robotController');

const {
  // sendGetAllSeedRobots,
  sendDeleteAllSeedRobots,
} = require('../controllers/dbSeedController');

const { checkAuthorization } = require('../controllers/authController');

const { isAdmin } = checkAuthorization;

const { refreshJWT } = require('../controllers/jwtRefreshController');

const { verifyAccessToken } = refreshJWT;

const router = express.Router();

// router.post('/robot', createRobot);
router.post('/robot', [verifyAccessToken], sendCreateRobot);
router.put('/robot/:id', updateRobot);
router.get('/robot/:id', getRobotById);
router.delete('/robot', [verifyAccessToken, isAdmin], sendDeleteAllSeedRobots);
// router.delete('/robot/:id', [verifyAccessToken], deleteRobot);
router.delete('/robot/:id', deleteRobot);
router.get('/getrobotlist', getAllRobots);

module.exports = router;
