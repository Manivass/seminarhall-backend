const express = require("express");
const connectionDB = require("./config/database");
const authRouter = require("./routes/auth");
const cookieParser = require("cookie-parser");
const adminRouter = require("./routes/admin");
const cors = require("cors");
const userRouter = require("./routes/user");
const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use("/", cookieParser());
app.use("/", express.json());
app.use("/", authRouter);
app.use("/", adminRouter);
app.use("/", userRouter);

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
