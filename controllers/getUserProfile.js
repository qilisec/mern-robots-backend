const dotenv = require('dotenv');

dotenv.config();
const { Users } = require('../models/users-model');

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

const getUserProfile = async (req, res) => {
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

module.exports = { retrieveFullAccountInfo, getUserProfile };
