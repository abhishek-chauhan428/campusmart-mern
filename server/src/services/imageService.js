const cloudinary = require('../config/cloudinary');

const FOLDER = 'campusmart/listings';

const httpError = (statusCode, message) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const ensureConfigured = () => {
  const { cloud_name, api_key, api_secret } = cloudinary.config();
  if (!cloud_name || !api_key || !api_secret) {
    throw httpError(503, 'Image storage is not configured on the server');
  }
};

const uploadBuffer = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: FOLDER,
        resource_type: 'image',
        // keep stored images reasonably small
        transformation: [{ width: 1600, height: 1600, crop: 'limit' }, { quality: 'auto' }],
      },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(buffer);
  });

// Best-effort delete. Never throws: a failed cleanup must not fail the request.
const deleteImages = async (publicIds = []) => {
  if (!publicIds.length) return;
  try {
    ensureConfigured();
    await Promise.allSettled(publicIds.map((id) => cloudinary.uploader.destroy(id)));
  } catch (err) {
    console.error('Cloudinary cleanup failed:', err.message);
  }
};

// Uploads all files. If any one fails, the ones that succeeded are removed again
// so we never leave orphaned images behind.
const uploadImages = async (files = []) => {
  if (!files.length) return [];
  ensureConfigured();

  const results = await Promise.allSettled(files.map((file) => uploadBuffer(file.buffer)));
  const uploaded = results.filter((r) => r.status === 'fulfilled').map((r) => r.value);

  if (uploaded.length !== files.length) {
    results.filter((r) => r.status === 'rejected').forEach((r) => console.error('Cloudinary upload error:', r.reason?.message));
    await deleteImages(uploaded.map((u) => u.public_id));
    throw httpError(502, 'Image upload failed. Please try again.');
  }

  return uploaded.map((u) => ({ url: u.secure_url, publicId: u.public_id }));
};

module.exports = { uploadImages, deleteImages };
