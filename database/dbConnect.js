const mongoose = require("mongoose");

const dbUrl = `${process.env.DB_URL.replace(
  "<USER>",
  process.env.DB_USER
).replace("<PASSWORD>", process.env.DB_PASSWORD)}`;

async function dbConnect() {
  try {
    await mongoose.connect(dbUrl);
    console.log("Database Connected Successfully");
  } catch (error) {
    console.log("Error occured in DB!", error);
  }
}

module.exports = { dbConnect };
