const Robot = require('../models/robotsModel');
const { Users, Roles, validRoles } = require('../models/usersModel');
const { newSignupAuth } = require('./authController');
const { seedList } = require('../models/seedUsers');

const { log } = console;

const reseedUsers = async (req, res, mock = 0) => {
  // Check roles/add missing roles with queryDBContainsSeedRoles.
  const addedRoles = await queryDBContainsSeedRoles(validRoles);
  const inputSeeds = req?.body?.seedList ? req.body.seedList : seedList;

  try {
    const queueSeeds = await Promise.all(
      inputSeeds.map(async (inputSeed) => {
        const { username, email } = inputSeed;

        const checkThenRegister = dbCheck(Users, { username, email })
          .then((exists) =>
            !exists && !mock
              ? newSignupAuth(inputSeed)
              : newSignupAuth(inputSeed, true)
          )
          .catch((err) => err);

        if (!checkThenRegister)
          return log(`User ${username} already exists in DB`);
        return inputSeed;
      })
    );

    queueSeeds
      ? res.status(200).send({
          message: `reseedUsers: seed users created`,
          users: queueSeeds,
        })
      : console.log(`reseedUsers: Didn't fire; added roles: ${addedRoles}`);
  } catch (err) {
    const message = `reseedUsers: Finished ERROR: ${err}`;
    console.trace(message, err);
    res.send({ message });
  }
};

const sendDeleteSeedUsers = async (req, res) => {
  try {
    const deletedSeeds = await clearSeedUsers();
    const message = `deleteSeedUsers: seedUsers deleted`;
    console.log(message, deletedSeeds);
    return res.status(200).send({ message, deletedSeeds });
  } catch (err) {
    const message = `deleteSeedUsers: delete ERROR: ${err}`;
    console.log(message);
    return res.status(404).send({ message });
  }
};

const clearSeedUsers = async () => {
  console.log(`clearSeedUsers invoked`);
  const seedRoleId = Roles.findOne({ name: 'seed' })
    .then((foundRole) => {
      console.log(`clearSeedUsers: foundRole`, foundRole);
      return Users.deleteMany({
        roles: {
          $elemMatch: { $eq: foundRole._id },
        },

        username: { $not: /admin/ },
      });
    })
    .then((deletion) => {
      console.log(`clearSeedUsers: deletedUsers`, deletion);
      return deletion;
    })
    .catch((err) => err);

  return seedRoleId;
};

const dbCheck = async (targetCollection, inputQueries, name = '') => {
  const check = targetCollection
    .find(inputQueries)
    .lean()
    .then((found) => {
      // ATTN: Can't use found !== [] as conditional because the object references  for found and "[]" will never be the same
      if (found.length > 0) {
        log(`dbCheck: ${name} found is truthy`);
        // log(found);
        return found;
      }
      log(`dbCheck: ${name} found is falsy`);
      return false;
    })
    .catch((err) => err);
  return check;
};

const queryDBContainsSeedRoles = async (validRoleList) => {
  try {
    const rolesQuery = { name: { $in: validRoleList } };
    const checkRoles = dbCheck(Roles, rolesQuery, 'Roles')
      .then((check) => check)
      .catch((err) => err);

    const checkCount = (await checkRoles)?.length;

    if (checkCount !== validRoleList.length) {
      // If lengths not equal, wipe existing roles from DB and re-add them;
      log(`queryDBContainsSeedRoles: clearing seed roles:
      checkCount.length = ${checkCount}
      validRoleList.length = ${validRoleList.length}`);
      await Roles.deleteMany(rolesQuery);

      for (const role of validRoleList) {
        const matchRoleSchema = { name: role };
        const newDbRole = new Roles(matchRoleSchema);

        newDbRole
          .save()
          .then((res) => res)
          .catch((err) => {
            console.trace(err);

            return false;
          });
      }
    }
    console.log(
      `queryDBContainsSeedRoles: ${checkCount} Roles out of ${validRoleList.length} already in db`
    );
    // Should also return true
    return true;
  } catch (err) {
    return err;
  }
};

const clearDbRoles = async () => {
  // Delete all roles in DB
  const rolesDelete = Roles.deleteMany({})
    .then((complete) => {
      console.log(`typeof complete: ${typeof complete}`);
      return true;
    })
    .catch((err) => err);

  return rolesDelete;
};

const clearSeedUsersAndRoles = async () => {
  const clearUsers = clearSeedUsers();
  const clearRoles = clearDbRoles();
  const removalFinish = await Promise.all([clearUsers, clearRoles]);
  if (removalFinish) return true;
  return false;
};

const sendDeleteAllSeedRobots = async (req, res) => {
  try {
    console.log(`sendDeleteAllSeedRobots req.body`, req.body);
    const deletedRobots = await Robot.deleteMany({ createdBy: 'seed' });
    return res.status(200).send({
      message: `sendDeleteAllSeedRobots: deletion success:`,
      deletions: deletedRobots,
    });
  } catch (err) {
    log(`sendDeleteAllSeedRobots: error: ${err}`);
  }
};

const sendGetAllSeedRobots = async (req, res) => {
  Robot.find({}, (err, robots) => {
    if (err) {
      return res.status(400).json({ success: false, error: err });
    }
    if (!robots.length) {
      return res.status(404).json({ success: false, error: `Robot not found` });
    }
    return res.status(200).json({ success: true, data: robots });
  }).catch((err) => console.log(err));
};

module.exports = {
  reseedUsers,
  sendDeleteSeedUsers,
  dbCheck,
  queryDBContainsSeedRoles,
  clearSeedUsersAndRoles,
  sendDeleteAllSeedRobots,
  sendGetAllSeedRobots,
};
