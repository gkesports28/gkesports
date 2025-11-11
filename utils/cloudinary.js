const cloudinary = require("cloudinary").v2;
const streamifier = require('streamifier');

cloudinary.config({
  cloud_name: "dja0zfbtw",
  api_key: "539984429883515",
  api_secret: "8Xq3LrDWh3MCmL19XWP1AUgZ0ZU",
});

const uploadImageToCloudinary = async (fileBuffer) => {
  try {
    if (fileBuffer) {
      const uploadFromBuffer = (buffer) => {
          return new Promise((resolve, reject) => {
              const stream = cloudinary.uploader.upload_stream({
                  folder: "gk-esport",
              }, (error, result) => {
                  if (error) {
                      reject(error);
                  } else {
                      resolve(result);
                  }
              });
              streamifier.createReadStream(buffer).pipe(stream);
          });
      };
      const result = await uploadFromBuffer(fileBuffer.buffer);
      return result.url;
  }
  } catch (error) {
    
  }
};

module.exports = { uploadImageToCloudinary };
