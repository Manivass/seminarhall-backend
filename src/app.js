const express = require("express");
const connectionDB = require("./config/database");
const app = express();



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
