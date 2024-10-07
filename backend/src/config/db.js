const mongoose = require("mongoose");
const User = require("../models/user.model.js");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('MongoDB connected');

    const isDevelopment = process.env.NODE_ENV === 'development';

    // Check if test user exists
    const existingUser = await User.findOne({ email: "test@test.com" });

    if (isDevelopment) {
      if (!existingUser) {
        // Create test user if it doesn't exist in development mode
        const testUser = new User({
          _id: new mongoose.Types.ObjectId("66fd4bd317f5050bfe264d3c"),
          name: "Test",
          email: "test@test.com",
          isActive: true,
          token: "",
          role: ["user"],
          password: "$2b$10$oQP6rgFOWX6lA5WDf.Y34eVdFN5c0A2Jq/oXwbwU8VX7Azp353qlm", // hashed password -> "test"
        });

        await testUser.save();
        console.log("Test user created in development mode");
      }
    } else {
      // Remove test user if it exists in non-development mode
      if (existingUser) {
        await User.deleteOne({ email: "test@test.com" });
        console.log("Test user removed in production mode");
      }
    }
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
