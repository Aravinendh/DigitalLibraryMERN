const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

// Check if Cloudinary credentials are provided
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('Cloudinary credentials are missing. Please check your .env file.');
}

// Cloudinary configuration
try {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  
  // Test the configuration
  console.log('Cloudinary configuration loaded successfully.');
} catch (error) {
  console.error('Error configuring Cloudinary:', error);
}

module.exports = cloudinary;
