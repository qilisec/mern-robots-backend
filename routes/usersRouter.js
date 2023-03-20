const express = require('express');
const {
  authenticateSignup,
  authenticateSignIn,
  logoutUser,
  // getAllUsers,
  checkAuthorization,
} = require('../controllers/authController');

const { isAdmin, isModerator } = checkAuthorization;

const { refreshJWT } = require('../controllers/jwtRefreshController');
const { getUserProfile } = require('../controllers/getUserProfile');

const {
  verifyAccessToken,
  createAccessToken,
  createRefreshToken,
  refreshAccessToken,
  checkAccessTokenAge,
  sendRefreshToken,
} = refreshJWT;

const {
  // checkMissingRoles,
  checkExistingAccount,
  checkValidRole,
  sendAuthorization,
} = require('../controllers/userController');

const { allAccess, userBoard, adminBoard, moderatorBoard } = sendAuthorization;

const router = express.Router();

// /////////////////////////////
// /// Authentication Routes ///
// /////////////////////////////
router.post('/authentication/signin', authenticateSignIn);
router.post(
  '/authentication/signup',
  [checkExistingAccount, checkValidRole],
  authenticateSignup
);
router.post(`/authentication/logout`, [verifyAccessToken], logoutUser);

// ////////////////////////////
// /// Authorization Routes ///
// ////////////////////////////
router.post('/authentication/refresh', sendRefreshToken);
router.put('/authentication/refresh', refreshAccessToken);

// ////////////////////////////
// ///      User Routes     ///
// ////////////////////////////
router.post(`/users/:userId`, [verifyAccessToken], getUserProfile);

router.get('/test/all', allAccess);
router.get('/test/user', [verifyAccessToken], userBoard);
router.get('/test/mod', [verifyAccessToken, isModerator], moderatorBoard);
router.get('/test/admin', [verifyAccessToken, isAdmin], adminBoard);

module.exports = router;
