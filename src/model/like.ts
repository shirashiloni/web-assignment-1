import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({
  userId: {
    type: String,
    ref: 'user',
    required: true,
  },
  postId: {
    type: String,
    ref: 'post',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

likeSchema.index({ userId: 1, postId: 1 }, { unique: true });

export default mongoose.model("like", likeSchema);
