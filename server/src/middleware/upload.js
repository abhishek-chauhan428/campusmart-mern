const multer = require('multer');
const { MAX_IMAGES, MAX_IMAGE_SIZE, ALLOWED_IMAGE_TYPES } = require('../constants/listing');

const upload = multer({
  storage: multer.memoryStorage(), // buffers go straight to Cloudinary, nothing touches disk
  limits: { fileSize: MAX_IMAGE_SIZE, files: MAX_IMAGES },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) return cb(null, true);
    const err = new Error('Only JPEG, PNG and WebP images are allowed');
    err.statusCode = 400;
    cb(err);
  },
});

// Field name expected from the client: "images"
const uploadListingImages = upload.array('images', MAX_IMAGES);

module.exports = { uploadListingImages };
