const express = require("express");

const authRouter = express.Router();

const bcrypt = require("bcrypt");
const { User } = require("../models/user.js");
const jwt = require("jsonwebtoken");

const { validationData } = require("../validators/authValidator.js");

//sign up api
authRouter.post("/signup", async (req, res) => {
  console.log(req.body);

  const { error } = validationData(req.body);

  if (error) {
    return res.status(400).json({
      errors: error.details.map((detail) => detail.message),
    });
  }

  const { firstName, lastName, emailId, password, gender } = req.body;

  const hashPassword = await bcrypt.hash(password, 10);
  console.log(hashPassword);

  try {
    const user = new User({ ...req.body, password: hashPassword });
    await user.save();
    res.send("user created");
  } catch (error) {
    console.log(error);
    res.status(400).send("some error occured");
  }
});

// login api
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(404).send("User not found");
    }

    const isPasswordValid = await bcrypt.compare(String(password), user.password);

    if (!isPasswordValid) {
      return res.status(401).send("Invalid credentials");
    }

    const token = jwt.sign({ _id: user._id }, "SECRET_KEY", {
      expiresIn: "1h",
    });

    res.cookie("token", token);

    return res.status(200).json({ message: "Login successful", user });

  } catch (error) {
    console.error(error);
    res.status(500).send("Some error occurred");
  }
});


//logout api
authRouter.post("/logout", (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.send("Logout successfully");
});

module.exports = { authRouter };
