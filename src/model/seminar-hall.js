const mongoose = require("mongoose");

const seminarHallSchema = new mongoose.Schema(
  {
    hallName: {
      type: String,
      required: true,
      unique: true,
    },
    capacity: {
      type: Number,
      min: 1,
      required: true,
    },
    facilities: {
      type: [String],
      validate: function (value) {
        if (value.length > 10 || value.length < 0) {
          throw new Error(
            "facilities must be greater than 0  and less than 10",
          );
        }
      },
    },
    status: {
      type: String,
      default: "active",
      enum: {
        values: ["active", "maintenance"],
        message: `{VALUE} is not valid status`,
      },
    },
  },
  {
    timestamps: true,
  },
);

const SeminarHall = new mongoose.model("SeminarHall", seminarHallSchema);
module.exports = SeminarHall;
