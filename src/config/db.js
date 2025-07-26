const mongoose = require("mongoose");

const db = async () => {
  try {
    await mongoose.connect("mongodb+srv://ayush195a:Welcome%40123@namastenode.ix0zgm7.mongodb.net/?retryWrites=true&w=majority&appName=NamasteNode");
    console.log("conncetion successful");
  } catch (error) {
    console.log("some error occured");
  }
};

module.exports = db;
