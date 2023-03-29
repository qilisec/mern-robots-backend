const Robot = require('../models/robotsModel');

const deleteAllSeedRobots = async (req, res) => {
  try {
    Robot.findOne({ robotId: 1 }, (err, foundRobot) => {
      if (err) {
        return console.log(
          `TEST ERROR Mongoose findOne: deleteAllSeedRobots: ${err}`
        );
      }

      console.log(
        `TEST Mongoose findOne: deleteAllSeedRobots invoked: ${foundRobot.firstName}`
      );
      return res.status(200).send({
        message: `TEST Mongoose findOne: deleteAllSeedRobots invoked: ${foundRobot.firstName}`,
        ...foundRobot,
      });
    });
  } catch (err) {
    console.log(`TEST ERROR Full Scope: deleteAllSeedRobots: ${err}`);
    return err;
  }
};

const getAllRobots = async (req, res) => {
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
  deleteAllSeedRobots,
  getAllRobots,
};
