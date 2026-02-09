const jwt = require("jsonwebtoken");
const User = require("../model/user");

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(400).send("please login....");
    }
    const decoded = jwt.verify(token, "SEMINARHALL@123#");
    const { emailId } = decoded;
    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(400).send("no user found");
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).send(err.message);
  }
};

module.exports = userAuth;
