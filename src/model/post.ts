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
    required: true,
  },
});

export default mongoose.model("post", postSchema);
