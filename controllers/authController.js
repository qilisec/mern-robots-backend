/* eslint-disable dot-notation */
const dotenv = require('dotenv');

dotenv.config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Users, Roles } = require('../models/users-model');

const { refreshJWT } = require('./jwtRefreshController');

const { createAccessToken, createRefreshToken } = refreshJWT;

const authenticateSignup = (req, res) => {
  const { username, email, password: unhashedPassword, roles } = req;
  const assignedRoles = roles[0];

  const newUser = new Users({
    username,
    email,
    password: bcrypt.hashSync(unhashedPassword, 8),
  });

  newUser.save((err, savedUser) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (roles) {
      Roles.find({ name: { $in: assignedRoles } }, (err, foundRoles) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        savedUser.roles = foundRoles.map((foundRole) => foundRole._id);
        savedUser.save((err, savedRoles) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
          if (res) res.send({ message: 'User was registered successfully!' });
          return savedRoles;
        });
      });
    } else if (!roles) {
      Roles.findOne({ name: 'user' }, (err, newRole) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        newUser.roles = [newRole._id];
        newUser.save((err) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
          res.send({ message: 'User was registered successfully!' });
        });
      });
    }
  });
};

const authenticateSignIn = async (req, res) => {
  const { username, password: unhashedPassword } = req.body;
  Users.findOne({
    username,
  })
    .populate('roles', '-__v')
    .exec((err, foundUser) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (!foundUser) {
        return res.status(404).send({ message: 'User Not found.' });
      }

      const passwordIsValid = bcrypt.compareSync(
        unhashedPassword,
        foundUser.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: `Invalid Password for ${foundUser.username}!`,
        });
      }
      const userCredentials = {
        username: foundUser.username,
        userId: foundUser._id,
        role: foundUser.roles[0],
      };
      const accessToken = createAccessToken(userCredentials);
      const refreshToken = createRefreshToken(userCredentials);

      console.log(
        `\nAUTH CONTROLLER: SIGN IN:
        Created AT: ${accessToken.slice(-10)};
        Created RT: ${refreshToken.slice(-10)}\n`
      );

      const authorities = [];
      for (let i = 0; i < foundUser.roles.length; i += 1) {
        authorities.push(`ROLE_${foundUser.roles[i].name.toUpperCase()}`);
      }

      const resContent = {
        id: foundUser._id,
        username: foundUser.username,
        email: foundUser.email,
        roles: authorities,
        accessToken,
        // Don't add rtkn here. It should only be stored in cookies
        // rtkn: refreshToken,
      };

      return (
        res
          .status(200)
          .cookie('rtkn', refreshToken, { httpOnly: true, secure: true })
          // Don't need / Can't set auth header here. Just provide the AT in the res.send and have the mapping of the AT to the headers occur on the front end.
          // .header({ Authorization: `bearerBackAuthController ${accessToken}` })
          .send(resContent)
      );
    });
};

const logoutUser = async (req, res) => {
  // Do I need to do this? Does this even do anything?
  res.header({ Authorization: `` });

  return res
    .clearCookie('rtkn')
    .status(200)
    .send({ message: 'User logged out successfully' });
};

const isAdmin = (req, res, next) => {
  Users.findById(req.userId).exec((err) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    Roles.find(
      {
        _id: { $in: Users.roles },
      },
      (err, roles) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        for (let i = 0; i < roles.length; i += 1) {
          if (roles[i].name === 'admin') {
            next();
            return;
          }
        }

        res.status(403).send({ message: 'Require Admin Role!' });
      }
    );
  });
};

const isModerator = (req, res, next) => {
  Users.findById(req.userId).exec((err) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    Roles.find(
      {
        _id: { $in: Users.roles },
      },
      (err, roles) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        for (let i = 0; i < roles.length; i += 1) {
          if (roles[i].name === 'moderator') {
            next();
            return;
          }
        }

        res.status(403).send({ message: 'Require Moderator Role!' });
      }
    );
  });
};

const checkAuthorization = {
  isAdmin,
  isModerator,
};

module.exports = {
  authenticateSignup,
  authenticateSignIn,
  logoutUser,
  checkAuthorization,
};
