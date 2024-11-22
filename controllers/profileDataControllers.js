const profile = require("../models/Profileform");

const getProfileData = async (req, res) => {
  try {
    const profileData = await profile.find();
    res.status(200).json(profileData);
  } catch (error) {
    console.error("Error fetching users: ", err);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
module.exports = { getProfileData };
