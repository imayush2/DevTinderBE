const express = require("express");
const userAuth = require("../middleware/userAuth");
const { User } = require("../models/user");
const { ConnectionRequest } = require("../models/connectionRequest");
const requestRouter = express.Router();

//sending request
requestRouter.post(
  "/request/send/:status/:touserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const status = req.params.status;
      const toUserId = req.params.touserId;

      // validation 1 : status should be valid
      const isAllowedStatus = ["interested", "ignored"];
      if (!isAllowedStatus.includes(status)) {
        return res.send("status is not valid");
      }

      // validatgion 2 : toUserId should be correct
      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.send("User invalid request");
      }

      //validation 3 : not seend the request again anad again +
      // if A sends to B the n B can't
      const existingConnectioRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      if (existingConnectioRequest) {
        return res.status(400).send("connection request already exists");
      }

      // validation 4 : same person can;t send to himself
      if (fromUserId.toString() == toUserId) {
        return res.status(400).send("You cannot send a request to yourself");
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();

      res.json({
        message:
          req.user.firstName + " is " + status + " in " + toUser.firstName,
        data,
      });
    } catch (error) {
      console.log("Error is ", error);
      res.status(400).send("some error occurred", error.message);
    }
  }
);

//receiving request
requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;

      const { status, requestId } = req.params;

      console.log("request id" , requestId);
      console.log("logged in useer" , loggedInUser._id);

      //validation 1 : status should be valid
      const isAllowedStatus = ["accepted", "rejected"];
      if (!isAllowedStatus.includes(status)) {
        return res.status(400).send("status is not allowed");
      }

      //validation : 2 requestId shpould be valid
      const isConnectionRequsestValid = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });

      if (!isConnectionRequsestValid) {
        return res.send("Cnnection request not find");
      }
      isConnectionRequsestValid.status = status;

      const data = await isConnectionRequsestValid.save();

      return res.json({ message: `Request ${status}`, data });
    } catch (error) {
      console.log("Erros is ", error);
      res.status(400).send("some error occured");
    }
  }
);



module.exports = { requestRouter };
