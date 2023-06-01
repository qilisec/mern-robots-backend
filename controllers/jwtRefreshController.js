const dotenv = require('dotenv');

dotenv.config();
const jwt = require('jsonwebtoken');

const accessSecret = process.env.JWT_SECRET_ACCESS;
const refreshSecret = process.env.JWT_SECRET_REFRESH;

const { log } = console;
// Middleware
const verifyAccessToken = (req, res, next) => {
  // Note that header key is always in all lowercase
  console.log(
    `verifyAccessToken invoked: auth header:`,
    req.headers.authorization.slice(-10)
  );
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
      console.log(`JWT verification failed`, decoded);
      return res
        .status(401)
        .send({ message: 'Unauthorized! - JWT Verification Failed' });
    }

    // console.log(`verifyAccessToken, req.body`, req.body);
    const userId = req.body?.userId ? req.body.userId : null;
    const username = req.body?.username ? req.body.username : null;

    // Take into account payload may differ between functions. Sometimes might be userId, sometimes username
    if (
      userId === decoded.userId ||
      username === decoded.username ||
      (userId === null && username === null)
    ) {
      console.log(`----verifyAT: check passed----`, accessToken?.slice(-8));
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
    log(
      `sendRefreshToken invoked by ${req.headers['current-function']}: rtkn:`,
      rtkn?.slice(-10)
    );
    // Is it possible that rtkn can't be read because it is http only?
    return res.status(200).send({ rtkn });
  } catch (err) {
    console.log(`sendRefreshToken Backend: err: ${err}`);
  }
};

const sendNewAccessToken = async (req, res) => {
  // log(`sendNewAccessToken invoked`, Object.entries(req.cookies));
  const cookieRefreshToken = req.cookies.rtkn;
  // log(`cookieRefreshToken`, cookieRefreshToken);

  try {
    const newAccessToken = await jwt.verify(
      cookieRefreshToken,
      process.env.JWT_SECRET_REFRESH,
      async (err, decoded) => {
        if (err) {
          return res.status(406).send({ message: `Unauthorized` });
        }

        const accessToken = createAccessToken(decoded);
        return accessToken;
      }
    );
    if (newAccessToken)
      log(
        `sendNewAccessToken invoked by ${req.headers['current-function']}: new access token:`,
        newAccessToken?.slice(-8)
      );
    return res.status(200).send({ newAccessToken });
  } catch (err) {
    console.log(`🚀 : file: jwtRefreshController.js:73 : err`, err);
  }
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
