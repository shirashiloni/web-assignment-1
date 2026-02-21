import mongoose from "mongoose";


const postSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  },
  caption: {
    type: String,
    required: true,
  },
  createDate: {
    type: Date,
    required: true,
  },
  userId: {
    type: String,
    ref: 'user',
    required: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  likeCount: {
    type: Number,
    default: 0,
  },
  commentsCount: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model("post", postSchema);
