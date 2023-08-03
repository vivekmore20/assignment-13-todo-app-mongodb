const mongoose = require("mongoose");
require("dotenv").config();

module.exports.init = async function () {
  await mongoose.connect(process.env.DB_URL);
  console.log("connected to db");
};
