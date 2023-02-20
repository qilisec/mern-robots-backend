const Robot = require('../models/robots-model');

const createRobot = async (req, res) => {
  const { body } = req;
  if (!body) {
    return res.status(490).json({
      success: false,
      error: 'Robot Creation Failed',
    });
  }

  const robot = new Robot(body);

  const checkRobot = await Robot.findOne(
    { robotId: Number(robot.robotId) },
    (err, targetRobot) => {
      if (err) {
        console.log("checkRobot didn't find a robot")
        // return res.status(400).json({ success: false, error: err });
      } else {
          console.log(`checkRobot found a robot with the same robotId: ${robot.robotId}`)
        //   return res.status(200).json({ success: true, data: targetRobot });
        return targetRobot
      }
    }
  ).catch((err) => console.log(err));

  if (!robot) {
    const output = res.status(491).json({ success: false, error: err, message: "not a robot" })
    console.log(`!robot: Output message is ${output.message}`);
    return output
  }

  if (!checkRobot) {
    const savedRobot = await robot.save()
    try {
      res.status(201).json({
        success: true,
        id: robot._id,
        message: 'Robot created!',
      }),
      console.log(`robot created: ${robot.robotId}`)
    
    } catch (err) {
      res.status(492).json({
        err,
        message: 'Robot not created!',
      })
    }
      }
};

const updateRobot = async (req, res) => {
  const { body } = req;

  if (!body) {
    return res.status(400).json({
      success: false,
      error: 'You must provide a body to update',
    });
  }

  Robot.findOne({_id: req.params.id }, (err, robot) => {
    if (err) {
      return res.status(404).json({
        err,
        message: 'Robot not found!',
      });
    }
    robot.robotId = body.robotId
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
  await Robot.findOneAndDelete({_id: req.params.id }, (err, robot) => {
    if (err) {
      return res.status(400).json({ success: false, error: err });
    } else {
        if (!robot) {
          return res.status(404).json({ success: false, error: `Robot not found` });
        }
    
        return res.status(200).json({ success: true, data: robot });
    }

  }).catch((err) => console.log(err));
};

const getRobotById = async (req, res) => {
  if (req.params.id === "undefined" || req.params.id === Number("NaN")) 
  {
    req.params.id = -1
    return res.status(489).json({ success: false })
};
  await Robot.findOne({ id: req.params.id }, (err, robot) => {
    try {
      if (err) {
        return res.status(488).json({ success: false, error: err });
      } else {
          return res.status(200).json({ success: true, data: robot });
      }
    } catch (err) {
      console.log(`getRobotById Error: ${err}`)
    }
  })
};

const getRobots = async (req, res) => {
  await Robot.find({}, (err, robots) => {
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
  createRobot,
  updateRobot,
  deleteRobot,
  getRobotById,
  getRobots,
};
