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
  user: {
    type: String,
    ref: 'user',
    required: true,
  },
  tags: {
    type: [String],
    default: [],
  },
});

export default mongoose.model("post", postSchema);
