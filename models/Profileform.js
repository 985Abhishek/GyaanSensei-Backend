const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    age: { type: Number },
    gender: { type: String, required: true },
    skills: { type: [String], default: [] },
    skillDescription: { type: String, default: "" },
    rating: { type: Number, default: 0 },
    avatar: { type: String },
    media: { type: [String], default: [] },
  },
  { timestamps: true }
);

const Profile = mongoose.model("Profile", ProfileSchema);

module.exports = Profile;
