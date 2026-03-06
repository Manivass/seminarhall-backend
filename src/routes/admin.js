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
    const { hallName, capacity, facilities, status, photoURL } = req.body;
    const seminarHall = new SeminarHall({
      hallName,
      capacity,
      facilities,
      status,
      photoURL,
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

adminRouter.get("/admin/pending-details", userAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const loggedUser = req.user;
    if (loggedUser.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "only admin can do this" });
    }
    const pendingDetails = await Booking.find({ status: "pending" })
      .populate("hallId", "hallName capacity status photoURL")
      .populate("userId", "firstName lastName photoURL")
      .skip(skip)
      .limit(limit);
    res.status(200).json({
      success: true,
      message: "pending list successfully fetched",
      data: pendingDetails,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

adminRouter.patch(
  "/admin/booking/:status/:hallId",
  userAuth,
  async (req, res) => {
    try {
      const loggedUser = req.user;
      const status = req.params.status;
      const hallId = req.params.hallId;

      if (loggedUser.role !== "admin") {
        return res
          .status(403)
          .json({ success: false, message: "only admin can do this" });
      }

      if (status !== "pending") {
        return res
          .status(403)
          .json({
            success: false,
            message: "only pending status can change state",
          });
      }

      if (!["accepted", "rejected"].includes(status)) {
        return res
          .status(400)
          .json({ success: false, message: "invalid status" });
      }

      const isHallAvailable = await Booking.findById(hallId);
      if (!isHallAvailable) {
        return res
          .status(404)
          .json({ success: false, message: "No hall Available" });
      }

      isHallAvailable.status = status;
      await isHallAvailable.save();

      res.status(200).json({
        success: true,
        message: `status ${status} is changed successfully`,
      });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },
);

module.exports = adminRouter;
