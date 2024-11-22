const cloudinary = require("../config/cloudinaryConfig");
const Profile = require("../models/Profileform");

const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ resource_type: "auto" }, (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      })
      .end(file.buffer);
  });
};

const createProfile = async (req, res) => {
  console.log("Got Formdata to backend", req.body);

  try {
    const { username, age, gender, skills, skillDescription, rating } =
      req.body;

    const skillsArray = skills
      ? skills.split(",").map((skill) => skill.trim())
      : [];

    const avatarUrls = req.files.avatar
      ? await uploadToCloudinary(req.files.avatar[0])
      : null;

    

    const mediaUrls = [];
    if (req.files.media) {
      for (let file of req.files.media) {
        const mediaUrl = await uploadToCloudinary(file);
        mediaUrls.push(mediaUrl);
      }
    }

    const newProfile = new Profile({
      username,
      age,
      gender,
      skills: skillsArray,
      skillDescription,
      rating,
      avatar: avatarUrls,
      media: mediaUrls,
    });

    await newProfile.save();

    res.status(201).json({
      message: "Profile created successfully!",
      profile: newProfile,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error. Could not create profile.",
      error: error.message,
    });
  }
};

module.exports = { createProfile };
