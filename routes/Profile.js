
const express = require('express');
const multer = require('multer');
const profileController = require('../controllers/profileController');


const storage = multer.memoryStorage();
const upload = multer({ storage,limits: {
  fileSize: 10 * 1024 * 1024, 
}, });

const router = express.Router();


router.post(
  '/create-profile',
  upload.fields([{ name: 'avatar'  }, { name: 'media', maxCount: 5 }]),  
  profileController.createProfile 
);

module.exports = router;