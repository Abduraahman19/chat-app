import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create unsigned upload preset
    await cloudinary.api.create_upload_preset({
      name: 'ml_default',
      unsigned: true,
      folder: 'chat-app',
      resource_type: 'auto',
      allowed_formats: 'jpg,jpeg,png,gif,webp,mp4,mov,avi,pdf,doc,docx,txt',
      max_file_size: 26214400, // 25MB
      quality: 'auto',
      fetch_format: 'auto'
    });

    res.status(200).json({ success: true });
  } catch (error) {
    // Preset already exists (409) or other validation error (400)
    if (error.http_code === 409 || error.http_code === 400) {
      res.status(200).json({ success: true, message: 'Preset already exists' });
    } else {
      console.error('Preset creation error:', error);
      res.status(500).json({ error: 'Failed to create preset' });
    }
  }
}