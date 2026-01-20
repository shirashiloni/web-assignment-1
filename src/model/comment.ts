import mongoose from "mongoose";
import { StringDecoder } from "node:string_decoder";

const postSchema = new mongoose.Schema({
  content: {
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
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'post',
    required: true,
  },
});

export default mongoose.model("comment", postSchema);
