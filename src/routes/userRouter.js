const express = require("express");
const { ConnectionRequest } = require("../models/connectionRequest");
const userAuth = require("../middleware/userAuth");
const { User } = require("../models/user");
const userRouter = express.Router();

const USER_SAFE_DATA = "firstName lastName skills  photoUrl age gender about";

// all request api
userRouter.get("/user/request/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const allRequest = await ConnectionRequest.find({
      status: "interested",
      toUserId: loggedInUser._id,
    }).populate("fromUserId", USER_SAFE_DATA);

    res.json({ message: "all request", allRequest });
  } catch (error) {
    console.log("error is", error);
    res.status(400).send("some error occured");
  }
});

// all connection api
userRouter.get("/user/conncetion", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const allConnection = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInUser._id, status: "accepted" },
        { toUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    if (!allConnection) {
      return res.send("No connection request");
    }

    const data = allConnection.map((row) => {
      if (row.fromUserId._id.toString() == loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });

    res.send(data);
  } catch (error) {
    console.log("error", error);
    res.status(400).send("some error occured");
  }
});

//feed api

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    //connection request (send + received)
    const connectionRequest = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    })
      .select("fromUserId toUserId")
      .populate("fromUserId", "firstName")
      .populate("toUserId", "firstName");

    const hideUserfromFeed = new Set();
    connectionRequest.forEach((req) => {
      hideUserfromFeed.add(req.fromUserId.id.toString());
      hideUserfromFeed.add(req.toUserId.id.toString());
    });
    console.log(hideUserfromFeed);

    const user = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUserfromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    console.log("users are ", user);

    res.send(user);
  } catch (error) {
    console.error("Error fetching connection requests:", error);
    res.status(500).send("Some error occurred");
  }
});

module.exports = userRouter;
