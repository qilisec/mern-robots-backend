const dotenv = require('dotenv');

dotenv.config();
const jwt = require('jsonwebtoken');

const accessSecret = process.env.JWT_SECRET_ACCESS;
const refreshSecret = process.env.JWT_SECRET_REFRESH;

// Middleware
const verifyAccessToken = (req, res, next) => {
  // Note that header key is always in all lowercase
  console.log(`verifyAccessToken invoked: req.body`, req.body);
  const authHeader = req.headers?.authorization
    ? req.headers.authorization
    : null;
  const accessToken = authHeader ? authHeader.split(' ')[1] : null;

  if (!accessToken) {
    console.log(`No access token: ${req.headers['current-function']}`);
    return res.status(403).send({
      message: `No token provided!`,
    });
  }

  jwt.verify(accessToken, process.env.JWT_SECRET_ACCESS, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'Unauthorized!' });
    }

    console.log(`verifyAccessToken, req.body.userId:`, req.body);
    const userId = req.body?.userId ? req.body.userId : null;
    const username = req.body?.username ? req.body.username : null;

    // Take into account payload may differ between functions. Sometimes might be userId, sometimes username
    if (userId === decoded.userId || username === decoded.username) {
      console.log(`----verifyAT: check passed----`);
      req.username = decoded.username;
      req.userId = decoded.userId;
      req.role = decoded.role;
    } else {
      console.log(
        `verifyAccessToken: data from decoded AT doesn't match provided:
        userId from fn argument: ${userId}
        header AT decoded userId: ${decoded.userId}`
      );
    }
    next();
  });
};

const createAccessToken = (userCredentials) => {
  const { username, userId, role } = userCredentials;
  const accessToken = jwt.sign({ username, userId, role }, accessSecret, {
    expiresIn: 1500, // 2 minutes (for testing)
  });
  return accessToken;
};

const createRefreshToken = (userCredentials) => {
  const { username, userId, role } = userCredentials;
  const refreshToken = jwt.sign({ username, userId, role }, refreshSecret, {
    expiresIn: 345600, // 4 days
  });

  return refreshToken;
};

// const checkAccessTokenAge = (req, res, next) => {
// };

const sendRefreshToken = async (req, res) => {
  try {
    const { rtkn } = req.cookies;

    // Is it possible that rtkn can't be read because it is http only?
    return res.status(200).send({ rtkn });
  } catch (err) {
    console.log(`sendRefreshToken Backend: err: ${err}`);
  }
};

const sendNewAccessToken = async (req, res) => {
  const cookieRefreshToken = req.cookies.rtkn;
  const argumentRefreshToken = req.body.refreshToken;
  if (cookieRefreshToken === argumentRefreshToken) {
    try {
      const newAccessToken = await jwt.verify(
        argumentRefreshToken,
        process.env.JWT_SECRET_REFRESH,
        async (err, decoded) => {
          if (err) {
            return res.status(406).send({ message: `Unauthorized` });
          }

          const accessToken = createAccessToken(decoded);
          return accessToken;
        }
      );
      return res.status(200).send({ newAccessToken });
    } catch (err) {
      console.log(`🚀 : file: jwtRefreshController.js:73 : err`, err);
    }
  } else
    console.log(`RTs from cookie and frontend getRefreshToken are not equal`);
};

const refreshJWT = {
  verifyAccessToken,
  createAccessToken,
  createRefreshToken,
  sendNewAccessToken,
  // checkAccessTokenAge,
  sendRefreshToken,
};

module.exports = { refreshJWT };
