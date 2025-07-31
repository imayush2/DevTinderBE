const express = require("express");
const crypto = require("crypto");
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
paymentRouter.post("/payment/webhook", express.raw({ type: "*/*" }), async (req, res) => {
  try {
    console.log("🔔 Webhook called");

    const webhookSignature = req.get("X-Razorpay-Signature");
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const rawBody = req.body.toString("utf8");

    // ✅ Validate signature
    const expected = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (expected !== webhookSignature) {
      console.log("❌ Invalid webhook signature");
      return res.status(400).json({ msg: "Invalid webhook signature" });
    }

    console.log("✅ Webhook signature verified");

    // ✅ Parse JSON after verification
    const parsed = JSON.parse(rawBody);
    const paymentDetails = parsed?.payload?.payment?.entity;

    if (!paymentDetails) {
      return res.status(400).json({ msg: "Invalid payload" });
    }

    // ✅ Update payment in DB
    const payment = await Payment.findOne({ razorpayOrderId: paymentDetails.order_id });
    if (!payment) return res.status(404).json({ msg: "Payment not found" });

    payment.status = paymentDetails.status;
    await payment.save();
    console.log("💾 Payment updated");

    // ✅ Update user premium status
    const user = await User.findById(payment.userId);
    if (user) {
      user.isPremium = true;
      user.membershipType = paymentDetails.notes?.memberType || "Silver";
      await user.save();
      console.log("👤 User premium updated");
    }

    return res.status(200).json({ msg: "Webhook processed successfully" });
  } catch (error) {
    console.error("❌ Webhook processing failed:", error);
    return res.status(500).send("Error in webhook processing");
  }
});


module.exports = paymentRouter;
