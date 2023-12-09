const express = require("express");
const app = express();
const { baseRoute } = require("./utils/baseRoute");
const cors = require("cors");
const session = require("express-session");
const expressSession = require("express-session");
const bodyParser = require("body-parser");
app.use(cors());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  })
);

app.use(
  expressSession({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    keys: [process.env.COOKIE_KEY],
  })
);
app.use("/uploads", express.static(__dirname + "/uploads"));

app.use(baseRoute + "/auth", require("./routes/userRoute"));
app.use(baseRoute + "/messages", require("./routes/messageRoute"));

module.exports = app;
