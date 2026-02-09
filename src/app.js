const express = require("express");
const connectionDB = require("./config/database");
const authRouter = require("./routes/auth");
const cookieParser = require("cookie-parser");
const adminRouter = require("./routes/admin");
const app = express();
app.use("/", cookieParser());
app.use("/", express.json());
app.use("/", authRouter);
app.use("/", adminRouter);

connectionDB()
  .then(() => {
    console.log("db successfully connected");
    app.listen("7777", () => {
      console.log("server successfully connected");
    });
  })
  .catch((err) => {
    console.log(console.log(err.message));
  });
