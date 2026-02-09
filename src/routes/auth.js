const express = require("express");
const User = require("../model/user");
const bcrypt = require("bcrypt");

const authRouter = express.Router();

authRouter.post("/signUp", async (req, res) => {
  try {
    validateAndSanitizeData(req.body);

    const { firstName, lastName, emailId, password } = req.body;

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      emailId,
      password: hashPassword,
    });

    await newUser.save();
    res.status(201).json({
      message: "user added successfully"
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
});
