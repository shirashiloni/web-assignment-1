import mongoose from "mongoose";


const postSchema = new mongoose.Schema({
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
});

export default mongoose.model("post", postSchema);
