const express = require("express");
const userAuth = require("../middleware/userAuth");
const SeminarHall = require("../model/seminar-hall");
const Booking = require("../model/booking");

const userRouter = express.Router();

// booking hall api
userRouter.post("/user/Hall-booking/:hallId", userAuth, async (req, res) => {
  try {
    const loggedUser = req.user;
    if (loggedUser.role !== "user") {
      return res
        .status(409)
        .json({ success: false, message: "only user can book slot" });
    }
    const hallId = req.params.hallId;
    const isHallAvailable = await SeminarHall.findById(hallId);
    if (!isHallAvailable) {
      return res.status(404).json({ success: false, message: "no hall found" });
    }
    const { date, startTime, endTime } = req.body;
    if (!date || !startTime || !endTime) {
      return res
        .status(403)
        .json({ success: false, message: "pls fill the credentials" });
    }
    const startTimeISO = new Date(`${date}T${startTime}:00`);
    const endTimeISO = new Date(`${date}T${endTime}:00`);
    if (isNaN(startTimeISO) || isNaN(endTimeISO)) {
      return res
        .status(400)
        .json({ success: false, message: "pls send the date and time" });
    }
    if (startTimeISO >= endTimeISO) {
      return res.status(400).json({
        success: false,
        message: "the startTime must smaller than the endTime",
      });
    }
    const isOverlapping = await Booking.findOne({
      hallId,
      startTime: { $lt: endTimeISO },
      endTime: { $gt: startTimeISO },
      status: { $in: ["accepted", "pending"] },
    });
    if (isOverlapping) {
      return res.status(400).json({
        success: false,
        message: "slot is already booked for this time",
      });
    }

    const newBooking = new Booking({
      userId: loggedUser._id,
      hallId,
      date,
      startTime: startTimeISO,
      endTime: endTimeISO,
    });
    await newBooking.save();
    res.status(201).json({ success: true, message: "slot is on pending list" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// booking - history

userRouter.get("/user/mybooking", userAuth, async (req, res) => {
  try {
    const loggedUser = req.user;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const totalCount = await Booking.countDocuments(filter);
    if (loggedUser.role !== "user") {
      return res.status(403).json({
        success: false,
        message: " only user can see the booking history",
      });
    }
    const status = req.query.status ? req.query.status : "accepted";
    if (!["accepted", "rejected", "pending"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "pls enter the valid status" });
    }
    const bookingHistory = await Booking.find({
      userId: loggedUser._id,
      status,
    })
      .select("hallId date startTime endTime status")
      .populate("hallId", "hallName capacity")
      .skip(skip)
      .limit(limit)
      .sort({ startTime: -1 });
    if (bookingHistory.length === 0) {
      return res
        .status(200)
        .json({ success: false, message: "no booking found" });
    }
    res.json({
      success: true,
      totalCount,
      data: bookingHistory,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// cancel the booking
userRouter.post(
  "/user/booking/:bookingId/cancel",
  userAuth,
  async (req, res) => {
    try {
      const loggedUser = req.user;
      if (loggedUser.role !== "user") {
        return res.status(403).json({
          success: false,
          message: "only user can cancel the booking",
        });
      }
      const bookingId = req.params.bookingId;
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res
          .status(404)
          .json({ success: false, message: "no booking slot found" });
      }
      if (!booking.userId.equals(loggedUser._id)) {
        return res
          .status(404)
          .json({ success: false, message: "this is not your booking slot" });
      }
      if (booking.status !== "pending") {
        return res
          .status(400)
          .json({ success: false, message: "status is not in pending status" });
      }
      if (new Date() > booking.startTime) {
        return res
          .status(400)
          .json({ success: false, message: "time already over" });
      }
      booking.status = "cancelled";
      await booking.save();
      res
        .status(201)
        .json({ success: true, message: "successfully cancelled", booking });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },
);

module.exports = userRouter;
