const { Users } = require('../models/users-model');

const validRoles = ['user', 'moderator', 'admin', 'public'];

// Middleware
// if req is coming from verify access token middleware, does the request still have the form: req.body.username?
const checkExistingAccount = (req, res, next) => {
  Users.findOne({
    username: req.body.username,
  }).exec((err, existingUsername) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (existingUsername) {
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
        res.status(400).send({ message: 'Failed! Email is already in use!' });
        return;
      }

      next();
    });
  });
};

const checkValidRole = (req, res, next) => {
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
  checkExistingAccount,
  checkValidRole,
  sendAuthorization,
};
