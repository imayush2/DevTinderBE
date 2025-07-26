const jwt = require("jsonwebtoken");
const { User } = require("../models/user");

//read the token
//verfiy the token
//find the user

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      throw new Error("token is not there");
    }

    //verify the token
    const decodeObj = await jwt.verify(token, "SECRET_KEY");
    const { _id } = decodeObj;

    //find the user
    const user = await User.findById(_id);
    if (!user) {
      throw new Error("User not found");
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(400).send("Error" + error.message);
  }
};

module.exports = userAuth;
