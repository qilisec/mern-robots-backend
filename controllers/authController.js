/* eslint-disable dot-notation */
const chalk = require('chalk');
const dotenv = require('dotenv');

dotenv.config();

const bcrypt = require('bcryptjs');
const { Users, Roles } = require('../models/usersModel');

const { refreshJWT } = require('./jwtRefreshController');

const { createAccessToken, createRefreshToken } = refreshJWT;

const { log } = console;

const sendNewSignupAuth = async (req, res) => {
  try {
    const newRegisteredUser = await newSignupAuth(req.body);
    if (await newRegisteredUser) {
      log(`sendNewSignupAuth`, newRegisteredUser);
      const { savedUser, accessToken, refreshToken } = newRegisteredUser;
      const { username, email, password, roles } = savedUser;
      console.log(`signup complete: ${newRegisteredUser}`);
      return res
        .status(200)
        .cookie('rtkn', refreshToken, { httpOnly: true, secure: true })
        .send({
          message: `User ${username}was registered successfully`,
          username,
          email,
          password,
          roles,
          accessToken,
        });
    }
    log(`sendNewSignupAuth: newRegisteredUser empty`, newRegisteredUser);
    return res.status(404).send({
      message: `sendNewSignupAuth failed: newRegisteredUser: ${newRegisteredUser}`,
    });
  } catch (err) {
    return res.status(200).send({ message: `SignupError: ${err}` });
  }
};

const newSignupAuth = async (registrationInfo) => {
  try {
    log(`newSignupAuth invoked: registrationInfo:`, registrationInfo);
    const { password: unhashedPassword, roles } = registrationInfo;

    // Don't place dbCheck in newSignupAuth function; decouple and insert dbcheck conditional in "parent" function
    // const checkUsers = dbCheck(Users, inputQueries, 'Users');
    // if ((await checkUsers).length === 0) {
    // log(chalk.red(`newSignupAuth: invoking generateNewUser:`, username));

    const roleIds = roles
      ? (await Roles.find({ name: { $in: roles } })).map(
          (found) =>
            // console.log(
            //   `newSignupAuth: ${username}: roles exists; found:`,
            //   found
            // );
            // console.log(
            //   `newSignupAuth: ${username}: found.name: ${found.name}; _id: ${found._id}`
            // );
            found._id
        )
      : (await Roles.find({ name: 'user' })).map((found) => {
          log(`roles doesn't exist`);
          return found._id;
        });

    if (roleIds.length === roles.length) {
      // log(`newSignupAuth: roleIds.length === roles.length`);
      // Better not to define newUser with decoupled variables because then I need to modify var names in multiple locations if I change the name in the underlying model (e.g. created => createdBy).
      // Better to lay down the base framework using registration info and subsequently overwrite.
      // const newUser = new Users({
      //   username,
      //   email,
      //   password: bcrypt.hashSync(unhashedPassword, 8),
      //   roles: roleIds,
      //   createdBy,
      // });

      const newUser = new Users(registrationInfo);
      newUser.password = bcrypt.hashSync(unhashedPassword, 8);
      newUser.roles = roleIds;
      newUser.createdBy = 'user';

      const savedUser = await newUser.save();

      const userCredentials = {
        username: savedUser.username,
        userId: savedUser._id,
        role: savedUser.roles[0],
      };
      const accessToken = createAccessToken(userCredentials);
      const refreshToken = createRefreshToken(userCredentials);
      const resContent = { savedUser, accessToken, refreshToken };

      log(`newSignupAuth: resContent`, resContent);
      return resContent;
    }
    log(`newSignupAuth: roleIds.length !== roles.length`);
  } catch (err) {
    // console.log(`newSignupAuth: role names and role IDs do not match: await roleIds: ${await roleIds};
  }
};

const sendSigninAuthentication = async (req, res) => {
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

const sendUserLogout = async (req, res) => {
  // Do I need to do this? Does this even do anything?
  res.header({ Authorization: `` });

  return res
    .clearCookie('rtkn')
    .status(200)
    .send({ message: 'User logged out successfully' });
};

const isAdmin = (req, res, next) => {
  // console.log(`isAdmin invoked; req.userId:`, req.userId);
  Users.findById(req.userId)
    .exec()
    .catch((err) => {
      res.status(500).send({ message: err });
      return err;
    })
    .then((foundUser) => {
      Roles.find(
        {
          _id: { $in: foundUser.roles },
        },
        (err, roles) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
          // log(`isAdmin: roles:`, roles);
          for (let i = 0; i < roles.length; i += 1) {
            // log(`roles[i].name: ${roles[i].name}`);
            if (roles[i].name === 'admin') {
              log(`${req.userId?.slice(-5)} is confirmed admin`);
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
  Users.findById(req.userId)
    .exec()
    .catch((err) => {
      res.status(500).send({ message: err });
    })
    .then((foundUser) => {
      Roles.find(
        {
          _id: { $in: foundUser.roles },
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
  sendNewSignupAuth,
  newSignupAuth,
  sendSigninAuthentication,
  sendUserLogout,
  checkAuthorization,
};
