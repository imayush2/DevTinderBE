const express = require("express");
const app = express();
const db = require("./config/db");
const { User } = require("./models/user");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const dotenv = require('dotenv');

dotenv.config();

const userAuth = require("./middleware/userAuth");
const { authRouter } = require("./routes/auth");
const { profileRouter } = require("./routes/profileRouter");
const { requestRouter } = require("./routes/requestRouter");
const userRouter = require("./routes/userRouter");
const paymentRouter = require("./routes/paymentRouter");

// 🟡 Setup CORS  first, before anything else that sends a response
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// 🟡 Body & cookie parsers
app.use(express.json());
app.use(cookieParser());

// 🟢 Routes
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/",paymentRouter)

// 🟡 Feed API (protected)
app.get("/profile", userAuth, async (req, res) => {
  try {
    console.log("Cookies:", req.cookies);
    res.send("profile data");
  } catch (error) {
    console.error(error);
    res.status(500).send("Some error occurred");
  }
});

// 🟡 Update user API
app.patch("/user/:userId", async (req, res) => {
  const userId = req.params.userId;
  const data = req.body;

  try {
    const user = await User.findByIdAndUpdate(userId, data, { new: true });
    res.send(user);
  } catch (error) {
    console.error(error);
    res.status(400).send("Something went wrong");
  }
});

// 🟡 Delete user API
app.delete("/user/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    await User.findByIdAndDelete(userId);
    res.send("User deleted");
  } catch (error) {
    console.error(error);
    res.status(400).send("Something went wrong");
  }
});

// 🟢 Connect to DB & start server
db().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`server is listing ${process.env.PORT}`);
  });
});
