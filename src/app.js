const express = require("express");
const crypto = require("crypto");
const db = require("./config/db");
const { User } = require("./models/user");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const userAuth = require("./middleware/userAuth");
const { authRouter } = require("./routes/auth");
const { profileRouter } = require("./routes/profileRouter");
const { requestRouter } = require("./routes/requestRouter");
const userRouter = require("./routes/userRouter");
const paymentRouter = require("./routes/paymentRouter");

const app = express();

// ✅ CORS setup
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ✅ Apply JSON parser to all routes except webhook
app.use((req, res, next) => {
  if (req.originalUrl.startsWith("/payment/webhook")) {
    next(); // skip JSON parsing
  } else {
    express.json()(req, res, next);
  }
});
app.use(cookieParser());

// ✅ Other Routes
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", paymentRouter);

// ✅ Protected profile route
app.get("/profile", userAuth, async (req, res) => {
  try {
    console.log("Cookies:", req.cookies);
    res.send("profile data");
  } catch (error) {
    console.error(error);
    res.status(500).send("Some error occurred");
  }
});

// ✅ Update User
app.patch("/user/:userId", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.userId, req.body, {
      new: true,
    });
    res.send(user);
  } catch (error) {
    console.error(error);
    res.status(400).send("Something went wrong");
  }
});

// ✅ Delete User
app.delete("/user/:userId", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.send("User deleted");
  } catch (error) {
    console.error(error);
    res.status(400).send("Something went wrong");
  }
});

// ✅ Start Server
db().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`🚀 Server running on port ${process.env.PORT}`);
  });
});
