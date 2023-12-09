const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    text: {
      type: String,
    },
    file: {
      type: String,
    },
    status: {
      type: String,
      enum: ["seen", "unseen"],
      default: "unseen",
    },
  },
  { timestamps: true }
);
const messageModel = mongoose.model("message", messageSchema);

module.exports = messageModel;
