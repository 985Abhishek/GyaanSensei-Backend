const express = require('express');
const{getProfileData} = require("../controllers/profileDataControllers");

const router = express.Router();

router.get("/profileData", getProfileData);

module.exports = router;