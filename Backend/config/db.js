const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/socialapp");  // No need for deprecated options
        console.log("Connected successfully");
    } catch (err) {
        console.log("Connection error", err);
    }
};

module.exports = connectDB;
