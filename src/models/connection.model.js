

import mongoose from 'mongoose';

const connectionSchema = new mongoose.Schema(
  {
    user1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    user2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Optional: Prevent duplicate connections (user1-user2 OR user2-user1)
connectionSchema.index(
  { user1: 1, user2: 1 },
  { unique: true, partialFilterExpression: { user1: { $exists: true }, user2: { $exists: true } } }
);

export default mongoose.model('Connection', connectionSchema);
