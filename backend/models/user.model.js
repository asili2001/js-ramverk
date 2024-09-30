import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  isActive: {
    type: Boolean,
    default: false
  },
  token: {
    type: String
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;
