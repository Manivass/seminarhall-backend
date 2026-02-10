const express = require("express");
const userAuth = require("../middleware/userAuth");
const SeminarHall = require("../model/seminar-hall");
const Booking = require("../model/booking");

const userRouter = express.Router();

userRouter.post("/user/Hall-booking", userAuth, async (req, res) => {
  try {
    let loggedUser = req.user;
    if (loggedUser.role !== "user") {
      return res.status(403).json({ message: "only user can book " });
    }
    const { hallId, date, startTime, endTime } = req.body;
    if (!hallId || !date || !startTime || !endTime) {
      return res.status(400).json({ message: "pls fill all the credentials" });
    }
    const isHallAvailable = await SeminarHall.findById(hallId);
    if (!isHallAvailable) {
      return res.status(404).json({ message: "no hall found.." });
    }
    const startTimeISO = new Date(`${date}T${startTime}:00`);
    const endTimeISO = new Date(`${date}T${endTime}:00`);
    if (isNaN(startTimeISO) || isNaN(endTimeISO)) {
      return res.status(400).send("pls give the valid timings");
    }
    if (startTimeISO >= endTimeISO) {
      return res.status(400).send("pls give the time correctly");
    }
    const newBooking = new Booking({
      userId: loggedUser._id,
      hallId,
      date,
      startTime: startTimeISO,
      endTime: endTimeISO,
    });
    await newBooking.save();
    res.status(201).json({ message: "successfully compelted" });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = userRouter;
