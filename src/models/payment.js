// models/Payment.js
const { required } = require("joi");
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: { 
        type: mongoose.Types.ObjectId,
        ref:"User",
        required:true 
      },
    paymentId: {
      type: String,
    },
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    amountDue: {
      type: Number,
      required: true,
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: "INR",
    },
    receipt: {
      type: String,
    },
    status: {
      type: String,
      required: true,
    },
    notes: {
      firstName: String,
      lastName: String,
      memberType: String,
    },
    offerId: {
      type: String,
      default: null,
    },
    createdAtRazorpay: {
      type: Number, // timestamp from Razorpay
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
