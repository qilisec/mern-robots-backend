const express = require('express');
const {
  sendNewSignupAuth,
  newSignupAuth,
  sendSigninAuthentication,
  sendUserLogout,
  // getAllUsers,
  // reseedUsers,
  checkAuthorization,
} = require('../controllers/authController');

const { isAdmin, isModerator } = checkAuthorization;

const { refreshJWT } = require('../controllers/jwtRefreshController');

const {
  verifyAccessToken,
  sendNewAccessToken,
  checkAccessTokenAge,
  sendRefreshToken,
} = refreshJWT;

const {
  sendUserProfile,
  checkExistingAccountByName,
  checkValidRole,
  sendAuthorization,
} = require('../controllers/userController');

const {
  reseedUsers,
  sendDeleteSeedUsers,
} = require('../controllers/dbSeedController');

const { allAccess, userBoard, adminBoard, moderatorBoard } = sendAuthorization;

const router = express.Router();

// /////////////////////////////
// /// Authentication Routes ///
// /////////////////////////////
router.post('/authentication/signin', sendSigninAuthentication);

router.post(
  '/authentication/signup',
  [checkExistingAccountByName, checkValidRole],
  sendNewSignupAuth
);
router.post(`/authentication/logout`, [verifyAccessToken], sendUserLogout);

// ////////////////////////////
// /// Authorization Routes ///
// ////////////////////////////
router.post('/authentication/refresh', sendRefreshToken);
router.put('/authentication/refresh', sendNewAccessToken);

// ////////////////////////////
// ///      User Routes     ///
// ////////////////////////////
router.post('/users', [verifyAccessToken, isAdmin], reseedUsers);
router.post(`/users/:userId`, [verifyAccessToken], sendUserProfile);
router.delete('/users', [verifyAccessToken, isAdmin], sendDeleteSeedUsers);

router.get('/test/all', allAccess);
router.get('/test/user', [verifyAccessToken], userBoard);
router.get('/test/mod', [verifyAccessToken, isModerator], moderatorBoard);
router.get('/test/admin', [verifyAccessToken, isAdmin], adminBoard);

module.exports = router;
