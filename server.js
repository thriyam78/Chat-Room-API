const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const app = require("./app");
const port = process.env.PORT || 8080;
const { dbConnect } = require("./database/dbConnect");
const ws = require("ws");
const jwt = require("jsonwebtoken");
const Message = require("./models/messageModel");
const { connect } = require("mongoose");
const fs = require("fs");

dbConnect();

const server = app.listen(port, () => {
  console.log("Server is running on port", port);
});

const wss = new ws.WebSocketServer({ server });

function notifyAboutOnlinePeople() {
  [...wss.clients].forEach((client) => {
    client.send(
      JSON.stringify({
        online: [...wss.clients].map((c) => ({
          userId: c.userId,
          username: c.username,
        })),
      })
    );
  });
}

wss.on("connection", (connection, req) => {
  connection.isAlive = true;
  connection.timer = setInterval(() => {
    connection.ping();
    connection.deathtimer = setTimeout(() => {
      connection.isAlive = false;
      clearInterval(connection.timer);
      connection.terminate();
      notifyAboutOnlinePeople();
    }, 1000);
  }, 5000);

  connection.on("pong", () => {
    clearTimeout(connection.deathtimer);
  });
  const token = new URL(req.url, "http://localhost:8080").searchParams.get(
    "token"
  );

  if (token) {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    const { userId, username } = decodedData;

    connection.userId = userId;
    connection.username = username;
  }
  connection.on("message", async (message) => {
    const messageData = JSON.parse(message.toString());
    const recipient = messageData?.recipient;
    const text = messageData?.text;
    const file = messageData?.file;
    let fileName = null;
    if (file) {
      const parts = file.name?.split(".") || [];

      const ext = parts[parts.length - 1];

      fileName = Date.now() + "." + ext;

      const pathName = __dirname + "/uploads/" + fileName;

      const BufferData = Buffer.from(file?.data, "base64");

      fs.writeFile(pathName, BufferData, { encoding: "base64" }, (err) => {
        if (err) {
          console.error("Error writing file:", err);
        } else {
          console.log("File Saved:", pathName);
        }
      });
    }
    if (recipient && (text || file)) {
      const messageDoc = await Message.create({
        sender: connection.userId,
        recipient,
        text,
        file: file ? fileName : null,
      });
      [...wss.clients]
        .filter((c) => c.userId === recipient)
        .forEach((c) =>
          c.send(
            JSON.stringify({
              text,
              sender: connection.userId,
              _id: messageDoc._id,
              file: file ? fileName : null,
              createdAt: messageDoc.createdAt,
            })
          )
        );
    }
  });
});
notifyAboutOnlinePeople();
wss.on("close", (data) => {
  console.log("disconnect", data);
});
