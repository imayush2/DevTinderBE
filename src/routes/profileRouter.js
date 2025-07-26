const express = require("express");

const profileRouter = express.Router();

const bcrypt = require("bcrypt");
const userAuth = require("../middleware/userAuth");
const {
  validateProfileEditData,
  validatePassword,
} = require("../validators/authValidator");
const { Connection } = require("mongoose");

// profile view
profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    res.send(loggedInUser);
  } catch (error) {
    console.log(error);
    res.status(400).send("some error occured");
  }
});

//profile edit
profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  //validate the edit data
  //update and chaneg and save
  try {
    if (!validateProfileEditData(req)) {
      return res.status(400).send("Invalid profile data");
    }
    const loggedInUser = req.user;

    console.log(loggedInUser);
    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));
    console.log(loggedInUser);

    res.send("profile updated");
    await loggedInUser.save();
  } catch (error) {
    res.status(400).send("Error" + (err.message || "Something went wrong"));
  }
});

//profile forgot password
profileRouter.patch("/profile/update/password", userAuth, async (req, res) => {
  try {
    const { OldPassword, newPassword } = req.body;
    const loggedInUser = req.user;

    console.log("OldPassword:", OldPassword);
    console.log("loggedInUser:", loggedInUser);
    console.log("loggedInUser.password:", loggedInUser?.password);

    validatePassword(newPassword); // Assumes this throws on invalid

    const checkPassword = await bcrypt.compare(
      OldPassword?.toString(),
      loggedInUser?.password?.toString()
    );
    console.log(checkPassword);

    if (!checkPassword) {
      return res.status(401).send("Old password is incorrect");
    }

    const hashPassword = await bcrypt.hash(newPassword, 10);
    loggedInUser.password = hashPassword;

    await loggedInUser.save();

    return res.status(200).send("Password updated");
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(400).send("Something went wrong");
  }
});

module.exports = { profileRouter };


