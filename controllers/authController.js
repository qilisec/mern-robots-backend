/* eslint-disable dot-notation */
const chalk = require('chalk');
const dotenv = require('dotenv');

dotenv.config();

const bcrypt = require('bcryptjs');
const { Users, Roles } = require('../models/usersModel');

const { refreshJWT } = require('./jwtRefreshController');

const { createAccessToken, createRefreshToken } = refreshJWT;

const { log } = console;

const sendSignupAuthentication = async (req, res) => {
  try {
    const newRegisteredUser = await registerNewUser(req.body);
    if (newRegisteredUser) {
      const { username, email, password, roles } = newRegisteredUser;
      console.log(`signup complete: ${newRegisteredUser}`);
      return res.status(200).send({
        message: `User ${username}was registered successfully`,
        username,
        email,
        password,
        roles,
      });
    }
  } catch (err) {
    return res.status(200).send({ message: `SignupError: ${err}` });
  }
};

const registerNewUser = async (registrationInfo) => {
  try {
    const {
      username,
      email,
      password: unhashedPassword,
      roles,
      created,
    } = registrationInfo;

    // Don't place dbCheck in registerNewUser function; decouple and insert dbcheck conditional in "parent" function
    // const checkUsers = dbCheck(Users, inputQueries, 'Users');
    // if ((await checkUsers).length === 0) {
    log(chalk.red(`registerNewUser: invoking generateNewUser:`, username));

    const roleIds = roles
      ? (await Roles.find({ name: { $in: roles } })).map(
          (found) =>
            // console.log(
            //   `registerNewUser: ${username}: roles exists; found:`,
            //   found
            // );
            // console.log(
            //   `registerNewUser: ${username}: found.name: ${found.name}; _id: ${found._id}`
            // );
            found._id
        )
      : (await Roles.find({ name: 'user' })).map((found) => {
          log(`roles doesn't exist`);
          return found._id;
        });

    if (roleIds.length === roles.length) {
      console.log(`registerNewUser: Lengths are equal:
      await roleIds: ${await roleIds}; roles: ${roles}`);
      const newUser = new Users({
        username,
        email,
        password: bcrypt.hashSync(unhashedPassword, 8),
        roles: roleIds,
        created,
      });

      const savedUser = newUser
        .save()
        .then((saved) => {
          if (!saved) return log(`registerNewUser: "saved" was empty:`);
          return saved;
        })
        .catch((err) => err);

      return savedUser;
    }
  } catch (err) {
    // console.log(`registerNewUser: role names and role IDs do not match: await roleIds: ${await roleIds};
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
  registerNewUser,
  sendSignupAuthentication,
  sendSigninAuthentication,
  sendUserLogout,
  checkAuthorization,
};
