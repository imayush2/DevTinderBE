const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, maxLength: 50 },
    lastName: {
      type: String,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, min: 3 },
    age: { type: Number, minLength: 18 },
    gender: { type: String },
    photoUrl: {
      type: String,
      default: "https://www.shutterstock.com/image.jpg",
    },
    about: { type: String, default: "This is default about of the user" },
    skills: { type: [String] },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = { User };
