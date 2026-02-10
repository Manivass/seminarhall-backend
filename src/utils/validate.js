const validator = require("validator");

const validateAndSanitizeData = (req) => {
  const { firstName, lastName, emailId, password } = req;
  if (!firstName) {
    throw new Error("please enter the first name");
  } else if (firstName.length < 3 || firstName.length > 20) {
    throw new Error("first name must between 3 to 20 characters");
  } else if (lastName && (lastName.length < 3 || lastName.length > 20)) {
    throw new Error("last name must between 3 to 20 characters");
  } else if (!emailId) {
    throw new Error("please enter your emaill");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("emailId is not valid");
  } else if (!password) {
    throw new Error("please enter the password");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("password is not strong");
  }
};

const validateAndSanitizeSeminarHall = (req) => {
  const { hallName, capacity, facilities, status } = req;
  if (!hallName) {
    throw new Error("please enter the hallName");
  } else if (capacity < 1) {
    throw new Error("capacity must be greater than 0");
  } else if (facilities > 10) {
    throw new Error("facilites must be less than 10");
  }
};

module.exports = { validateAndSanitizeData, validateAndSanitizeSeminarHall };
