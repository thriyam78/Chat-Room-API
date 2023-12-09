const messageModel = require("../models/messageModel");

async function getAllMessage(req, res) {
  try {
    const senderId = req.params.userId;
    const userId = req.user.userId; //using middleware to decode the token and get the userId
    const messages = await messageModel
      .find({
        sender: { $in: [senderId, userId] },
        recipient: { $in: [senderId, userId] },
      })
      .sort({ createdAt: 1 })
      .exec();
    res.json(messages);
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: "Something went wrong",
      error: error.message,
    });
  }
}

module.exports = { getAllMessage };
