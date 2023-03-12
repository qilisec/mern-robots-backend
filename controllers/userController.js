const { Users } = require('../models/users-model');

const validRoles = ['user', 'moderator', 'admin'];

// Middleware
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

// Check on DB initialization
// const checkMissingRoles = async () => {
//   const checkRoles = Roles.estimatedDocumentCount(async (err, count) => {
//     if (!err && count === 0) {
//       const userRole = new Roles({
//         name: 'user',
//       });
//       const moderatorRole = new Roles({
//         name: 'moderator',
//       });
//       const adminRole = new Roles({
//         name: 'admin',
//       });
//       try {
//         try {
//           await userRole.save();
//           console.log(`checkMissingRoles added missing role: ${userRole.name}`);
//         } catch (err) {
//           console.log(`checkMissingRoles error: ${err}`);
//         }

//         try {
//           moderatorRole.save();
//           console.log(
//             `checkMissingRoles added missing role: ${moderatorRole.name}`
//           );
//         } catch (err) {
//           console.log(`checkMissingRoles error: ${err}`);
//         }

//         try {
//           adminRole.save();
//           console.log(
//             `checkMissingRoles added missing role: ${adminRole.name}`
//           );
//         } catch (err) {
//           console.log(`checkMissingRoles error: ${err}`);
//         }
//         console.log(`Missing roles recovered`);
//         return true;
//       } catch (err) {
//         console.log(`checkMissingRoles: Error recovering missing roles`);
//         console.trace(err);
//       }
//     } else {
//       console.log(`No missing roles`);
//       return false;
//     }
//   });
//   return checkRoles;
// };

// const seedUsers = async () => {
//   const rolesPresent = await checkMissingRoles();
//   const userRoleID = await getRoleObjectID('user');

//   const initialUser1 = new Users({
//     username: 'user1',
//     email: 'user1@test.com',
//     password: '1',
//   });

//   const initialUser2 = new Users({
//     username: 'user2',
//     email: 'user2@test.com',
//     password: '2',
//   });

//   const initialUser3 = new Users({
//     username: 'user3',
//     email: 'user3@test.com',
//     password: '3',
//   });

//   const seedList = [initialUser1, initialUser2, initialUser3];

//   Users.estimatedDocumentCount(async (err, count) => {
//     if (rolesPresent) {
//       if (!err && count === 0) {
//         try {
//           console.log(`seedUsers: count is ${count}`);
//           console.log(`seedUsers: userRoleID obtained ${userRoleID}`);
//           try {
//             seedList.forEach(async (user) => {
//               user.roles = [userRoleID];
//               await user.save();
//               console.log(`${user.username} created successfully`);
//             });
//           } catch (err) {
//             console.log(`seedUsers catch error`);
//             console.trace(err);
//           }
//           console.log(`seedUsers: ${initialUser1.username} added`);
//         } catch (err) {
//           console.log(`seedUsers: Couldn't get RoleObjectID: Error is ${err}`);
//           console.trace(err);
//         }
//       } else {
//         console.log(`Existing users found`);
//       }
//     } else {
//       console.log(`Roles are missing`);
//     }
//   });
// };

// const getRoleObjectID = async (roleName) => {
//   try {
//     const roleID = await Roles.findOne(
//       { name: `${roleName}` },
//       // Below is wrong, needs to have err as first argument
//       // async (foundRole) => {
//       async (err, foundRole) => {
//         try {
//           console.log(`objectId is ${foundRole}`);
//           const objectID = foundRole._id;
//           return objectID;
//         } catch {
//           console.log(`getRoleObjectID: ${err}`);
//           console.trace(err);
//         }
//       }
//     );
//     return roleID;
//   } catch (err) {
//     console.log(`getRoleObjectID error`);
//     console.trace(err);
//   }
// };

const checkAuthorization = {
  allAccess,
  userBoard,
  adminBoard,
  moderatorBoard,
};

module.exports = {
  checkExistingAccount,
  checkValidRole,
  // checkMissingRoles,
  // seedUsers,
  checkAuthorization,
};
