const express = require("express");
const crypto = require("crypto");
const db = require("./config/db");
const { User } = require("./models/user");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const server = require("socket.io");

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



// ✅ Start Server
db().then(() => {
  server.listen(process.env.PORT, () => {
    console.log(`🚀 Server running on port ${process.env.PORT}`);
  });
}); 
