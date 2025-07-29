import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      //   trim: true,
      //   unique: true,
      //   required: true,
    },
    fullName: {
      type: String,
    },
    email: {
      type: String,
      //   trim: true,
      //   lowercase: true,
      //   unique: true,
      //   required: true,
    },
    phoneNumber: {
      type: String,
      // required: true,
      // match: /^[0-9+\-()\s]{7,20}$/,
    },
    password: {
      type: String,
      //   required: true,
      // minlength: 8
    },
    avatar: {
      type: String,
    },
    cover: {
      type: String,
    },
    bio: {
      type: String,
      // maxLength: 200
    },
    location: {
      type: String,
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    socketId: { type: String },
    isOnline: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
