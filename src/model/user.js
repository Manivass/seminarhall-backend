const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      minLength: 3,
      maxLength: 20,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      minLength: 3,
      maxLength: 20,
      trim: true,
    },
    emailId: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      validate: function (value) {
        if (!validator.isEmail(value)) {
          throw new Error("emaild id is not valid");
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate: function (value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("password is not strong");
        }
      },
    },
    role: {
      type: String,
      required: true,
      default: "user",
      enum: {
        values: ["user", "admin"],
        message: `{VALUE} is not valid role`,
      },
    },
  },
  {
    timestamps: true,
  },
);

userSchema.methods.comparePasswordAndHash = async function (newPassword) {
  const user = this;
  const isPasswordCrt = await bcrypt.compare(newPassword, user.password);
  return isPasswordCrt;
};

userSchema.methods.getJWT = async function () {
  const user = this;
  const token = jwt.sign({ emailId: user.emailId }, "SEMINARHALL@123#");
  return token;
};

const User = new mongoose.model("User", userSchema);

module.exports = User;
