const express = require("express");
const userAuth = require("../middleware/userAuth");
const { validateAndSanitizeSeminarHall } = require("../utils/validate");
const SeminarHall = require("../model/seminar-hall");
const Booking = require("../model/booking");
const adminRouter = express.Router();

adminRouter.post("/admin/add-seminar-Hall", userAuth, async (req, res) => {
  try {
    const loggedUser = req.user;
    if (loggedUser.role !== "admin") {
      return res
        .status(409)
        .json({ success: false, message: "only admin add the seminar hall" });
    }
    validateAndSanitizeSeminarHall(req.body);
    const { hallName, capacity, facilities, status } = req.body;
    const seminarHall = new SeminarHall({
      hallName,
      capacity,
      facilities,
      status,
    });
    await seminarHall.save();
    res
      .status(201)
      .json({ success: true, message: "hall successfully added", seminarHall });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

adminRouter.patch("/admin/booking/:bookingId", userAuth, async (req, res) => {
  try {
    const loggedUser = req.user;
    if (loggedUser.role !== "admin") {
      return res.status(403).send("only admin can do this");
    }
    const bookingId = req.params.bookingId;
    const bookingHall = await Booking.findById(bookingId);
    if (!bookingHall) {
      return res.status(404).json({ success: false, message: "no slot found" });
    }
    const { status } = req.body;
    if (!["accepted", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: `${status} is not valid status` });
    }

    bookingHall.status = status;
    await bookingHall.save();
    res.json({
      success: true,
      message: `hall ${status} successfully`,
      bookingHall,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = adminRouter;
