import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary.config.js";

const MIME_TYPE_MAP = {
  "image/jpeg": "image",
  "image/png": "image",
  "image/gif": "image",
  "image/webp": "image",
  "video/mp4": "video",
  "video/webm": "video",
  "video/quicktime": "video",
  "application/pdf": "file",
  "application/msword": "file",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "file",
  "application/vnd.ms-excel": "file",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "file",
  "application/zip": "file",
};

export const uploadFileToCloudinary = async (file) => {
  if (!file) {
    throw new Error("File is required");
  }

  try {
    const mediaType = MIME_TYPE_MAP[file.mimetype] || "file";
    const resourceType = mediaType === "image" ? "image" : mediaType === "video" ? "video" : "raw";

    const result = await uploadToCloudinary(file.buffer, file.originalname, resourceType);

    return {
      url: result.secure_url,
      type: mediaType,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      cloudinaryId: result.public_id,
      duration: result.duration || null,
    };
  } catch (error) {
    throw new Error(`File upload failed: ${error.message}`);
  }
};

export const uploadMultipleFiles = async (files) => {
  if (!files || files.length === 0) {
    throw new Error("At least one file is required");
  }

  const uploadPromises = files.map((file) => uploadFileToCloudinary(file));
  const results = await Promise.all(uploadPromises);

  return results;
};

export const deleteMediaFiles = async (mediaArray) => {
  if (!mediaArray || mediaArray.length === 0) {
    return;
  }

  const deletePromises = mediaArray.map((media) => {
    if (media.cloudinaryId) {
      return deleteFromCloudinary(media.cloudinaryId);
    }
  });

  await Promise.all(deletePromises);
};
