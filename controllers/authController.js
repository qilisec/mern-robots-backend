const dotenv = require('dotenv')
dotenv.config()

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Users, Roles } = require('../models/users-model');
// const { secret } = require('../keys/jwtSecretKey');
const secret = process.env.JWT_SECRET

const authenticateSignup = (req, res) => {
  const { username, email, password: unhashedPassword, roles } = req;
  // req password is unhashed password, req roles is the name of the role.
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

// const authenticateSignup = (req, res) => {
//   // console.log(`authStartUp started: ${Object.keys(req)}`);
//   // using req
//   console.log(`authenticateSignup req is ${req}`);

//   // console.log(`authStartUp started: ${req}`);
//   const { username, email, password: unhashedPassword, roles } = req;
//   const assignedRoles = roles[0];
//   // const newUser = new Users({
//   //   username: req.username,
//   //   email: req.email,
//   //   password: bcrypt.hashSync(req.password, 8),
//   // });
//   const newUser = new Users({
//     username,
//     email,
//     password: bcrypt.hashSync(unhashedPassword, 8),
//   });
//   // using req.body
//   // console.log(`authStartUp started: ${req.body}`);
//   // const newUser = new Users({
//   //   username: req.body.username,
//   //   email: req.body.email,
//   //   password: bcrypt.hashSync(req.body.password, 8),
//   // });

//   // console.log(`authenticateSignup: newUser is ${newUser}`);
//   console.log(`authenticateSignup: assignedRoles is ${assignedRoles}`);

//   newUser.save((err, savedUser) => {
//     if (err) {
//       res.status(500).send({ message: err });
//       return;
//     }
//     console.log(`authenticateSignup: user is ${savedUser}`);
//     // console.log(`authenticateSignup: user.role ${user.roles[0]}`);
//     // if (req.body.roles) {
//     // if (req.roles) {
//     if (roles) {
//       // console.log(`authenticateSignup: req.roles is ${req.roles}`);
//       console.log(`assignedRoles is ${assignedRoles}`);
//       Roles.find(
//         {
//           // name: { $in: req.body.roles },
//           name: { $in: roles[0] },
//         },
//         (err, roles) => {
//           if (err) {
//             res.status(500).send({ message: err });
//             return;
//           }
//           savedUser.roles = roles.map((role) => {
//             console.log(`mapped roles: Start is ${role}, end is ${role._id}`);
//             return role._id;
//           });
//           console.log(
//             `after finding user role, savedUser.roles is ${savedUser.roles}`
//           );
//           savedUser.save((err, addedRoles) => {
//             if (err) {
//               res.status(500).send({ message: err });
//               return;
//             }
//             // why doesn't res.send work
//             // res.send({ message: 'User was registered successfully!' });
//             console.log(
//               `authenticateSignup: User was registered successfully! addedRolesis ${addedRoles}`
//             );
//             // return addedRoles;
//           });
//         }
//       );
//     } else {
//       Roles.findOne({ name: 'user' }, (err, newRole) => {
//         if (err) {
//           res.status(500).send({ message: err });
//           return;
//         }

//         newUser.roles = [newRole._id];
//         newUser.save((err) => {
//           if (err) {
//             res.status(500).send({ message: err });
//             return;
//           }

//           res.send({ message: 'User was registered successfully!' });
//         });
//       });
//     }
//   });
//   console.log(`user was registered successfuly, saved user is ${saved.user}`);
// };

const authenticateSignIn = (req, res) => {
  Users.findOne({
    username: req.body.username,
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
        req.body.password,
        foundUser.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: `Invalid Password!
          Username: ${foundUser.username},
          Password: ${foundUser.password}`,
        });
      }

      // Creating JWT access token
      const accessToken = jwt.sign({ id: foundUser.id }, secret, {
        expiresIn: 120, // 2 minutes (for testing)
      });

      const authorities = [];

      for (let i = 0; i < foundUser.roles.length; i += 1) {
        authorities.push(`ROLE_${foundUser.roles[i].name.toUpperCase()}`);
      }
      res.status(200).send({
        id: foundUser._id,
        username: foundUser.username,
        email: foundUser.email,
        roles: authorities,
        accessToken,
      });
    });
};

// const authenticateSignIn = (req, res) => {
//   console.log(`authenticateSignin was called`);
//   Users.findOne({
//     username: req.body.username,
//   })
//     .populate('roles', '-__v')
//     .exec((err, foundUser) => {
//       if (err) {
//         res.status(500).send({ message: err });
//         return;
//       }

//       if (!foundUser) {
//         return res.status(404).send({ message: 'User Not found.' });
//       }

//       const passwordIsValid = bcrypt.compareSync(
//         req.body.password,
//         foundUser.password
//       );

//       // original
//       // if (!passwordIsValid) {
//       //   return res.status(401).send({
//       //     accessToken: null,
//       //     message: 'Invalid Password!',
//       //   });
//       // }

//       // For testing
//       if (!passwordIsValid) {
//         console.log(`Invalid Password!
//         foundUser Username: ${foundUser.username}, req.body.username: ${
//           req.body.username
//         }, equal? ${foundUser.username === req.body.username}`);
//         console.log(
//           `foundUser Password: ${foundUser.password}, req.body.passsword: ${
//             req.body.password
//           } equal? ${foundUser.password === req.body.password}`
//         );
//         return res.status(401).send({
//           accessToken: null,
//           message: `Invalid Password!
//           Username: ${foundUser.username},
//           Password: ${foundUser.password}`,
//         });
//       }

//       const token = jwt.sign({ id: foundUser.id }, secret, {
//         expiresIn: 86400, // 24 hours
//       });

//       const authorities = [];

//       for (let i = 0; i < foundUser.roles.length; i++) {
//         authorities.push(`ROLE_${foundUser.roles[i].name.toUpperCase()}`);
//       }
//       res.status(200).send({
//         id: foundUser._id,
//         username: foundUser.username,
//         email: foundUser.email,
//         roles: authorities,
//         accessToken: token,
//       });
//     });
// };

const verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token'];

  if (!token) {
    return res.status(403).send({ message: 'No token provided!' });
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'Unauthorized!' });
    }
    req.userId = decoded.id;
    next();
  });
};

const isAdmin = (req, res, next) => {
  Users.findById(req.userId).exec((err, user) => {
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
    return user;
  });
};

const isModerator = (req, res, next) => {
  Users.findById(req.userId).exec((err, user) => {
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
    return user;
  });
};

const authenticateJwt = {
  verifyToken,
  isAdmin,
  isModerator,
};

module.exports = { authenticateSignup, authenticateSignIn, authenticateJwt };
