const { Users, validRoles } = require('../models/usersModel');

const { log } = console;
// Middleware
// if req is coming from verify access token middleware, does the request still have the form: req.body.username?

const sendUserProfile = async (req, res) => {
  const retrievedData = await retrieveFullAccountInfo(req);
  const { username, roles, email } = retrievedData;

  console.log(`getUserProfile: retrievedData
  username: ${username}
  email: ${email}
  roles: ${roles}`);

  if (username && roles && email) {
    return res.status(200).send({
      message: `Profile data for user: ${req.body.userId.slice(-5)} obtained`,
      username,
      roles,
      email,
    });
  }
  return res.status(404).send({ message: ` 🔴 getUserProfile failed:` });
};

const retrieveFullAccountInfo = async (profileQuery) => {
  const { userId } = profileQuery.body;
  const retrievedInfo = Users.findOne({ _id: userId })
    .populate('roles')
    .then((foundUser) => {
      const { username, email } = foundUser;

      const authorities = [];
      for (let i = 0; i < foundUser.toJSON().roles.length; i += 1) {
        // console.log(`Role ${i}: ${roles[i].name}`);
        authorities.push(`${foundUser.roles[i].name.toUpperCase()}`);
      }

      const fullAccountInfo = { username, email };
      // roles property needs to be added to fullAccountInfo this way to prevent interfering with above destructuring
      fullAccountInfo.roles = authorities;

      // console.log(`retrieveFullAccountInfo
      // username: ${username}
      // email: ${email}
      // role: ${roles}`);
      return fullAccountInfo;
    })
    .catch((err) => {
      console.log(`🔭 retrieveInfo: Could not find user ${userId.slice(-5)}`);
      return null;
    });
  return retrievedInfo;
};

const checkExistingAccountByName = async (req, res, next) => {
  log(`checkExistingAccountByName invoked: req.body`, req.body);
  Users.findOne({
    username: req.body.username,
  }).exec((err, existingUsername) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (existingUsername) {
      log(`Failed! Username is already in use!`);
      res.status(400).send({ message: 'Failed! Username is already in use!' });
      return;
    }

    Users.findOne({
      email: req.body.email,
    }).exec((err, existingEmail) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (existingEmail) {
        console.log('Failed! Email is already in use!');
        res.status(400).send({ message: 'Failed! Email is already in use!' });
        return;
      }

      next();
    });
  });
};

const checkValidRole = (req, res, next) => {
  log(`checkValidRole invoked`);
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i += 1) {
      if (!validRoles.includes(req.body.roles[i])) {
        res.status(400).send({
          message: `Failed! Role ${req.body.roles[i]} does not exist!`,
        });
        return;
      }
    }
  }

  next();
};

const allAccess = (req, res) => {
  res.status(200).send('Public');
};

const userBoard = (req, res) => {
  res.status(200).send('User');
};

const adminBoard = (req, res) => {
  res.status(200).send('Admin');
};

const moderatorBoard = (req, res) => {
  res.status(200).send('Moderator');
};

const sendAuthorization = {
  allAccess,
  userBoard,
  adminBoard,
  moderatorBoard,
};

module.exports = {
  retrieveFullAccountInfo,
  sendUserProfile,
  checkExistingAccountByName,
  checkValidRole,
  // reseedUsers,
  sendAuthorization,
};
