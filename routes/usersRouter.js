const express = require('express');

const {
  authenticateSignup,
  authenticateSignIn,
  authenticateJwt,
} = require('../controllers/authController');

const { verifyToken, isAdmin, isModerator } = authenticateJwt;

const {
  // checkMissingRoles,
  checkExistingAccount,
  checkValidRole,
  checkAuthorization,
} = require('../controllers/userController');

const { allAccess, userBoard, adminBoard, moderatorBoard } = checkAuthorization;

const router = express.Router();

// User signup route
router.post(
  '/authentication/signup',
  [checkExistingAccount, checkValidRole],
  authenticateSignup
);
// User signin route
router.post('/authentication/signin', authenticateSignIn);

router.get('/test/all', allAccess);
router.get('/test/user', [verifyToken], userBoard);
router.get('/test/mod', [verifyToken, isModerator], moderatorBoard);
router.get('/test/admin', [verifyToken, isAdmin], adminBoard);

module.exports = router;
