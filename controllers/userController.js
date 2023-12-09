const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
async function Register(req, res) {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      username: username,
      password: hashedPassword,
    });
    newUser.password = undefined;
    const token = jwt.sign(
      { userId: newUser._id, username, status: newUser.status },
      process.env.JWT_SECRET
    );
    res
      .cookie("token", token)
      .status(200)
      .json({
        status: "success",
        message: "User Created Successfully",
        data: {
          user: newUser,
          token,
        },
      });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Something went wrong",
      error: error.message,
    });
  }
}

async function Login(req, res) {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username }).select(
      "-resetPasswordExpires -resetPasswordToken"
    );

    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid UserName or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user?.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid email or password",
      });
    }

    user.password = undefined;

    const token = jwt.sign(
      { userId: user._id, username, status: user.status },
      process.env.JWT_SECRET
    );
    res.cookie("token", token).status(200).json({
      status: "succes",
      message: "Logged In Successfully!",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: "Something went wrong",
      error: error.message,
    });
  }
}

async function getAllUser(req, res) {
  try {
    const allUsers = await User.find({}, { _id: 1, username: 1 });
    res.status(200).json({
      status: "success",
      allUsers,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: "Something went wrong",
      error: error.message,
    });
  }
}

async function updateStatus(req, res) {
  const status = req.params.status;
  const userId = req.user.userId;

  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { status: status },
      { new: true }
    );
    updatedUser.password = undefined;
    const token = jwt.sign(
      {
        userId: updatedUser._id,
        username: updatedUser.username,
        status: updatedUser.status,
      },
      process.env.JWT_SECRET
    );
    if (updatedUser) {
      res.status(200).json({
        status: "success",
        message: "User status updated successfully",
        data: {
          user: updatedUser,
          token,
        },
      });
    } else {
      res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: "Something went wrong",
      error: error.message,
    });
  }
}
module.exports = { Register, Login, getAllUser, updateStatus };
