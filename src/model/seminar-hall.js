const mongoose = require("mongoose");
const validator = require("validator");
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
      type: String,
      validate: function (value) {
        if (value.length > 40 || value.length < 0) {
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
    photoURL: {
      type: String,
      default:
        "https://www.designmania.gr/wp-content/uploads/2022/09/Seminar-Hall-05.jpg",
      validate: function (value) {
        if (!validator.isURL(value)) {
          throw new Error("URL is not valid");
        }
      },
    },
  },
  {
    timestamps: true,
  },
);

const SeminarHall = new mongoose.model("SeminarHall", seminarHallSchema);
module.exports = SeminarHall;
