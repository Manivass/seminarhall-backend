const express = require("express");
const userAuth = require("../middleware/userAuth");
const SeminarHall = require("../model/seminar-hall");
const Booking = require("../model/booking");
const Booking = require("../model/booking");

const userRouter = express.Router();

userRouter.post("/user/Hall-booking/:hallId", userAuth, async (req, res) => {
  try {
    const loggedUser = req.user;
    if (loggedUser.role !== "user") {
      return res.status(403).send("only user can book slot");
    }
    const hallId = req.params.hallId;
    const isHallAvailable = await SeminarHall.findById(hallId);
    if (!isHallAvailable) {
      return res.status(404).send("no hall found");
    }
    const { date, startTime, endTime } = req.body;
    if (!date || !startTime || !endTime) {
      return res.status(400).send("pls fill the credentials");
    }
    const startTimeISO = new Date(`${date}T${startTime}:00`);
    const endTimeISO = new Date(`${date}T${endTime}:00`);
    if (isNaN(startTimeISO) || isNaN(endTimeISO)) {
      return res.status(400).send("pls send the date and time");
    }
    if (startTimeISO >= endTimeISO) {
      return res
        .status(400)
        .send("the startTime must smaller than the endTime");
    }
    const isOverlapping = await Booking.findOne({
      hallId,
      startTime: { $lt: endTimeISO },
      endTime: { $gt: startTimeISO },
      status: { $in: ["accepted", "pending"] },
    });
    if (isOverlapping) {
      return res.status(400).send("slot is already booked for this time");
    }

    const newBooking = new Booking({
      userId: loggedUser._id,
      hallId,
      date,
      startTime: startTimeISO,
      endTime: endTimeISO,
    });
    await newBooking.save();
    res.status(201).json({ message: "slot is on pending list" });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = userRouter;
