import mongoose from 'mongoose';

// Define Document schema
const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  previewImage: {
    type: mongoose.Schema.Types.String,
    default: null
  },
  usersWithAccess: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    accessLevel: {
      type: String,
      required: true
    }
  }],
  content: {
    type: String,
    default: null
  }
}, { timestamps: true }); // Adds createdAt and updatedAt fields automatically

// Create Document model
const Document = mongoose.model('Document', documentSchema);

export default Document;
