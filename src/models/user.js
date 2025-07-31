const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, maxLength: 50 },
    lastName: { type: String },
    emailId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, min: 3 },
    age: { type: Number, min: 18 },
    gender: { type: String },
    photoUrl: {
      type: String,
      default:
        "https://static.vecteezy.com/system/resources/thumbnails/048/926/084/small_2x/silver-membership-icon-default-avatar-profile-icon-membership-icon-social-media-user-image-illustration-vector.jpg",
    },
    about: { type: String, default: "This is default about of the user" },
    skills: { type: [String] },

    isPremium: { type: Boolean, default: false },
    membershipType: {
      type: String,
      enum: ["Free", "Silver", "Gold", "Platinum"],
      default: "Free",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = { User };
