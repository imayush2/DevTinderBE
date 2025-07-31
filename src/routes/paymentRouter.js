const express = require("express");
const userAuth = require("../middleware/userAuth");
const razorpayInstance = require("../utils/razorpay");
const Payment = require("../models/payment");
const membershipAmount = require("../utils/constant");
const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");
const { User } = require("../models/user");
const paymentRouter = express.Router();

paymentRouter.post("/payment/create", userAuth, async (req, res) => {
  const { memberType } = req.body;
  const { firstName, lastName } = req.user;
  try {
    const order = await razorpayInstance.orders.create({
      amount: membershipAmount[memberType] * 100,
      currency: "INR",
      receipt: "receipt#1",
      notes: {
        firstName: firstName,
        lastName: lastName,
        memberType: memberType,
      },
    });

    //save order in your db
    console.log(order);
    const payment = new Payment({
      userId: req.user._id,
      razorpayOrderId: order.id,
      amount: order.amount,
      amountDue: order.amount_due,
      amountPaid: order.amount_paid,
      attempts: order.attempts,
      currency: order.currency,
      receipt: order.receipt,
      status: order.status,
      notes: {
        firstName: order.notes.firstName,
        lastName: order.notes.lastName,
        memberType: order.notes.memberType,
      },
      offerId: order.offer_id,
      createdAtRazorpay: order.created_at,
    });
    const savePayment = await payment.save();

    // send the response
    res.json(savePayment);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating order");
  }
});

//webhook api
// paymentRouter.post("/payment/webhook", async (req, res) => {
//   try {
//     console.log("web-hook called");
//     const webhookSignature = req.get("X-Razorpay-Signature");

//     const isWebhookValid = validateWebhookSignature(
//       JSON.stringify(req.body),
//       webhookSignature,
//       process.env.RAZORPAY_WEBHOOK_SECRET
//     );

//     if (!isWebhookValid) {
//       return res.status(400).json("webhook signture is not valid");
//     }
//     console.log("valid webhook signature verified");

//     //if webhook is valid then store in db
//     const paymentDetails = req?.body?.payload?.payment?.entity;

//     const payment = await Payment.findOne({
//       razorpayOrderId: paymentDetails.order_id,
//     });
//     payment.status = paymentDetails.status;
//     await payment.save();
//     console.log("payment saved");

//     const user = await User.findOne({ _id: payment.userId });
//     user.isPremium = true;
//     user.membershipType = payment.notes.memberType;
//     await user.save();
//     console.log("user saved");
//     //update the user a premium

//     //return success response to razorpay
//     return res.status(200).json({ msg: "webhook received successfully" });
//   } catch (error) {
//     return res.status(500).send("Error in webhook api calling");
//   }
// });

module.exports = paymentRouter;
