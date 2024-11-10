const mongoose = require('mongoose');

// Define Document schema
const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    previewImage: {
      type: String, // Corrected type definition
      default: null,
    },
    usersWithAccess: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'User'
        },
        accessLevel: {
          type: String, // Change to String
          enum: ["owner", "editor", "reader"], // Use enum for validation
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Create Document model
const Document = mongoose.model("Document", documentSchema);

module.exports = Document;
