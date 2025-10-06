import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// Client-side upload function
export const uploadToCloudinary = async (file, resourceType = 'auto', folder = 'chat-app/messages') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'chat_media');
  formData.append('resource_type', resourceType);
  formData.append('folder', folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  return response.json();
};

// Upload preset configuration for profile pictures
export const PROFILE_UPLOAD_PRESET = {
  upload_preset: 'profile_pictures', // You'll create this in Cloudinary dashboard
  folder: 'chat-app/profiles',
  transformation: [
    { width: 400, height: 400, crop: 'fill', gravity: 'face' },
    { quality: 'auto', fetch_format: 'auto' }
  ],
  allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  max_file_size: 5000000, // 5MB
};

// Upload preset configuration for chat media
export const CHAT_MEDIA_PRESET = {
  upload_preset: 'chat_media', // You'll create this in Cloudinary dashboard
  folder: 'chat-app/messages',
  transformation: [
    { quality: 'auto', fetch_format: 'auto' }
  ],
  allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'mov', 'avi', 'pdf', 'doc', 'docx', 'txt'],
  max_file_size: 50000000, // 50MB
};

// Helper function to get optimized image URL
export const getOptimizedImageUrl = (publicId, options = {}) => {
  const {
    width = 800,
    height = 600,
    crop = 'limit',
    quality = 'auto',
    format = 'auto'
  } = options;
  
  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_${width},h_${height},c_${crop},q_${quality},f_${format}/${publicId}`;
};

// Helper function to get video thumbnail
export const getVideoThumbnail = (publicId) => {
  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/so_0,w_400,h_300,c_fill,q_auto,f_jpg/${publicId}.jpg`;
};