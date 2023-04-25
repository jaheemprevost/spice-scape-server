const cloudinary = require('cloudinary').v2;


// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

 
const uploadImage = async (base64String, folder) => {
  // Get timestamp in seconds.
  const timestamp = Math.round(new Date().getTime() / 1000);

  // Create signature
  const signature = await cloudinary.utils.api_sign_request({
    timestamp,
    folder
  }, process.env.API_SECRET); 

  const uploadOptions = { 
    api_key: process.env.API_KEY,
    folder,
    signature, 
    timestamp,
    resource_type: 'auto'
  }

  try {
    return await cloudinary.uploader.upload(base64String, uploadOptions)
  } catch(err) {
    throw new Error(err.message);
  }
  
}

const deleteImage = async (publicId) => {
  return await cloudinary.uploader.destroy(publicId, {invalidate: true, resource_type: 'image'});
}

module.exports = {
  uploadImage,
  deleteImage
};
