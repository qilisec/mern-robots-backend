const Robot = require('../models/robotsModel');

const sendCreateRobot = async (req, res) => {
  console.log(`sendCreateRobot invoked`);
  const { body } = req;

  if (!body) {
    return res.status(490).json({
      success: false,
      error: `Robot Creation Failed: No robot information found`,
    });
  }

  // NOTE: Is this really necessary. I can't think of when robotId will collide since we are defining robotIds specifically so that they don't. Additionally, I'm not sure whether any check at all is appropriate here since there are just so many fields that make up the robot schema; are we trying to reject robot creation if any of the fields match an existing robot? If not, then which fields?
  // NOTE: There is a conflict that arises from the need to save fetched robots as well as robots created by forms. With robots from fetch, the robotId exists when the request to save arrives from frontend. Thus, it makes sense to have a check at this point. However, for requests that come from user submitted forms, there is no robotId yet so the check will fail because robotId is undefined. If I let undefined robotIds pass through the check, it will probably end up causing robots to be saved to the db every fetch. I can think of two solutions:
  // NOTE: 1. Create some conditionals to allow form-submitted robots to skip the check. These conditionals can be placed either in createRobot or in checkRobotById (in that case I should probably just rename function)
  // 2. Create separate functions for fetch robots and form robots and have the check only be present for form robots
  // Note: Attempting #1 using the "createdBy" field of the request body
  const robotAlreadyExists = await checkRobot(body);

  if (!robotAlreadyExists) {
    try {
      const newRobot = await createRobot(body);
      if (!newRobot) {
        const output = res
          .status(491)
          .json({ success: false, message: 'not a robot' });
        console.log(`!robot: Output message is ${output.message}`);
        return output;
      }
      return res.status(201).send({
        success: true,
        id: newRobot._id,
        message: 'Robot created!',
      });
    } catch (err) {
      console.log(err);
      return res.status(492).json({
        err,
        message: 'Robot not created!',
      });
    }
  }

  return res.status(490).send({
    success: false,
    message: `A robot with robotId: ${robotAlreadyExists.robotId} already exists`,
  });
};

const checkRobot = async (robotInfo) => {
  const { createdBy, robotId } = robotInfo;
  if (createdBy === 'seed') {
    try {
      console.log(`checkRobot: robotId,`, robotId);
      const check = await Robot.findOne({ robotId: Number(robotId) });
      if (!check) return console.log("checkRobot didn't find a robot");
      // console.log(`checkRobot: check`, check);
      console.log(`checkRobot found a robot with the same robotId`, robotId);
      return check;
    } catch (err) {
      console.log(`checkRobot error:`, err);
    }
  }
  return false;
};

const createRobot = async (robotInfo) => {
  console.log(`createRobot Invoked`);
  const lastRobotId = await Robot.countDocuments();
  const newRobot = new Robot(robotInfo);

  if (!newRobot) {
    return false;
  }

  newRobot.robotId = lastRobotId + 1;
  if (newRobot) {
    try {
      return newRobot.save();
    } catch (err) {
      return console.log(
        `createRobot: save error: Failed to save new robot:`,
        err
      );
    }
  }
  return console.log(`createRobot error: Failed to create robot`);
};

const updateRobot = async (req, res) => {
  const { body } = req;

  if (!body) {
    return res.status(400).json({
      success: false,
      error: 'You must provide a body to update',
    });
  }

  Robot.findOne({ _id: req.params.id }, (err, robot) => {
    if (err) {
      return res.status(404).json({
        err,

        message: 'Robot not found!',
      });
    }
    robot.robotId = body.robotId;
    robot.firstName = body.firstName;
    robot.lastName = body.lastName;
    robot.maidenName = body.maidenName;
    robot.email = body.email;
    robot.password = body.password;
    robot.birthDate = body.birthDate;
    robot.image = body.image;
    robot.bloodGroup = body.bloodGroup;
    robot.eyeColor = body.eyeColor;
    robot.hair = body.hair;
    robot.address = body.address;
    robot.bank = body.bank;
    robot.company = body.company;
    robot.macAddress = body.macAddress;
    robot.university = body.university;
    robot.ein = body.ein;
    robot.userAgent = body.userAgent;
    robot.phone = body.phone;
    robot.domain = body.domain;
    robot.time = body.time;
    robot.age = body.age;
    robot.height = body.height;
    robot.weight = body.weight;

    robot
      .save()
      .then(() =>
        res.status(200).json({
          success: true,
          id: robot._id,
          message: 'Robot updated!',
        })
      )
      .catch((error) =>
        res.status(404).json({
          error,
          message: 'Robot not updated!',
        })
      );
  });
};

const deleteRobot = async (req, res) => {
  await Robot.findOneAndDelete({ _id: req.params.id }, (err, robot) => {
    if (err) {
      return res.status(400).json({ success: false, error: err });
    }
    if (!robot) {
      return res.status(404).json({ success: false, error: `Robot not found` });
    }

    return res.status(200).json({ success: true, data: robot });
  }).catch((err) => console.log(err));
};

const deleteAllSeedRobots = async (req, res) => {
  await Robot.find({});
};

const getRobotById = async (req, res) => {
  console.log(`getRobotById invoked: req.body`, req.body, req.params);
  if (req.params.id === 'undefined' || req.params.id === Number('NaN')) {
    req.params.id = -1;
    return res.status(489).json({ success: false });
  }
  const foundRobot = await Robot.findOne({ robotId: req.params.id });
  console.log(`getRobotById: foundRobot`, foundRobot);
  const resContent = {
    message: `foundRobot ${foundRobot.robotId}`,
    foundRobot,
  };
  return res.status(200).send(resContent);
  // await Robot.findOne({ id: req.params.id }, (err, robot) => {
  //   try {
  //     if (err) {
  //       return res.status(488).json({ success: false, error: err });
  //     }
  //     return res.status(200).json({ success: true, data: robot });
  //   } catch (err) {
  //     console.log(`getRobotById Error: ${err}`);
  //   }
  // });
};

const getRobotByCreator = async (req, res) => {
  const { body } = req;
  const { username } = body;
  try {
    const ownedRobots = await Robot.find({ createdBy: username });
    return res.status(200).send({ message: 'Found robots', ownedRobots });
  } catch (err) {
    console.log(`getRobotByCreator err:`, err);
  }
};

const getAllRobots = async (req, res) => {
  await Robot.find({}, (err, robots) => {
    if (err) {
      return res.status(400).json({ success: false, error: err });
    }
    if (!robots.length) {
      return res.status(404).json({ success: false, error: `Robot not found` });
    }
    return res.status(200).json({ data: robots });
  }).catch((err) => console.log(err));
};

module.exports = {
  sendCreateRobot,
  createRobot,
  updateRobot,
  deleteRobot,
  deleteAllSeedRobots,
  getRobotById,
  getAllRobots,
};
