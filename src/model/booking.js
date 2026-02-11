const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    hallId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "SeminarHall",
    },
    date: {
      type: Date,
      required: true,
      default: Date.now(),
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      default: "pending",
      enum: {
        values: ["accepted", "rejected", "pending"],
        message: `{VALUE} is not valid status type`,
      },
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Booking = new mongoose.model("Booking", bookingSchema);
module.exports = Booking;
