const express = require("express");
const User = require("../model/user");
const bcrypt = require("bcrypt");
const validateAndSanitizeData = require("../utils/validate");
const authRouter = express.Router();
const jwt = require("jsonwebtoken");

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
    const token = jwt.sign({ emailId: emailId }, "SEMINARHALL@123#");
    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 100 * 24 * 60 * 60),
    });
    res.status(201).json({
      message: "user added successfully",
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const emailAvailable = await User.findOne({ emailId });
    if (!emailAvailable) {
      return res.status(400).send("invalid credentials");
    }
    const isPasswordCorrect =
      await emailAvailable.comparePasswordAndHash(password);
    if (!isPasswordCorrect) {
      return res.status(400).send("invalid credentials");
    }
    const token = jwt.sign({ emailId: emailId }, "SEMINARHALL@123#");
    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 100 * 24 * 60 * 60),
    });
    res.status(201).json({ message: "succeessfully logged in" });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = authRouter;
