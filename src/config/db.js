const mongoose = require("mongoose");

const db = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("conncetion successful");
  } catch (error) {
    console.log("some error occured");
  }
};

module.exports = db;
