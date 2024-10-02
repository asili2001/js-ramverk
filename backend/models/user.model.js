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
  },
  role: {
    type: ["user", "admin"],
    default: "user",
    required: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret, options) => {
      ret.id = ret._id;
      ret.role = ret.role[0];
      delete ret._id;
      delete ret.__v;

      if (!options.includePassword) {
        delete ret.password;
      }
      if (!options.includeToken) {
        delete ret.token;
      }

      return ret;
    }
  }
});

const User = mongoose.model('User', userSchema);

export default User;
