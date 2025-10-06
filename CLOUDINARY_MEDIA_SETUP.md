# Cloudinary Media Upload Setup Guide

## Overview
This guide will help you set up Cloudinary for media sharing in your chat application, including images, videos, and files.

## Step 1: Cloudinary Account Setup

1. Go to [Cloudinary](https://cloudinary.com) and create a free account
2. Note down your:
   - Cloud Name
   - API Key
   - API Secret

## Step 2: Environment Variables

Add these to your `.env.local` file:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

## Step 3: Create Upload Presets

### For Chat Media (Required)

1. Go to your Cloudinary Dashboard
2. Navigate to Settings → Upload → Upload presets
3. Click "Add upload preset"
4. Configure as follows:

**Preset Name:** `chat_media`

**Basic Settings:**
- Signing Mode: Unsigned
- Folder: `chat-app/messages`
- Resource Type: Auto
- Access Mode: Public

**Upload Manipulations:**
- Quality: Auto
- Format: Auto
- Max file size: 50MB (52428800 bytes)

**Allowed Formats:**
```
jpg,jpeg,png,webp,gif,mp4,mov,avi,mkv,pdf,doc,docx,txt,zip,rar
```

**Advanced Settings:**
- Auto tagging: 70%
- Categorization: Google tagging
- Auto backup: Enabled

### For Profile Pictures (Optional - if not already created)

**Preset Name:** `profile_pictures`

**Basic Settings:**
- Signing Mode: Unsigned
- Folder: `chat-app/profiles`
- Resource Type: Image

**Upload Manipulations:**
- Width: 400
- Height: 400
- Crop: Fill
- Gravity: Face
- Quality: Auto
- Format: Auto

## Step 4: Security Settings (Recommended)

### Content Moderation
1. Go to Add-ons → Content Moderation
2. Enable automatic moderation for inappropriate content
3. Set up webhook notifications for moderation results

### Access Control
1. Set up allowed domains in Settings → Security
2. Add your domain (e.g., `yourdomain.com`, `localhost:3000`)

## Step 5: Optimization Settings

### Auto-optimization
1. Go to Settings → Image and Video API
2. Enable:
   - Auto quality
   - Auto format
   - Auto DPR (Device Pixel Ratio)

### Responsive Images
The app automatically generates responsive images using Cloudinary's transformation API.

## Step 6: Testing

1. Start your development server: `npm run dev`
2. Go to the chat page
3. Click the attachment (📎) button
4. Try uploading:
   - An image (JPG, PNG, WebP)
   - A video (MP4, MOV)
   - A document (PDF, DOC)

## Supported File Types

### Images
- JPG, JPEG, PNG, WebP, GIF
- Max size: 50MB
- Auto-optimized for web delivery

### Videos
- MP4, MOV, AVI, MKV
- Max size: 50MB
- Auto-compressed for web streaming
- Thumbnail generation included

### Documents
- PDF, DOC, DOCX, TXT
- ZIP, RAR archives
- Max size: 50MB

## Features Included

### Image Messages
- ✅ Auto-optimization
- ✅ Responsive delivery
- ✅ Fullscreen view
- ✅ Download option
- ✅ Loading states

### Video Messages
- ✅ Auto-compression
- ✅ Thumbnail generation
- ✅ Video controls
- ✅ Download option
- ✅ Duration display

### File Messages
- ✅ File type detection
- ✅ Size display
- ✅ Download functionality
- ✅ File icons

### Security Features
- ✅ File type validation
- ✅ Size limits
- ✅ Content moderation ready
- ✅ Secure URLs

## Troubleshooting

### Upload Fails
1. Check your environment variables
2. Verify upload preset exists and is unsigned
3. Check file size limits
4. Verify allowed file formats

### Images Don't Load
1. Check CORS settings in Cloudinary
2. Verify cloud name in environment variables
3. Check browser console for errors

### Performance Issues
1. Enable auto-optimization in Cloudinary settings
2. Use responsive image delivery
3. Consider implementing lazy loading

## Cost Optimization

### Free Tier Limits
- 25 GB storage
- 25 GB bandwidth/month
- 1,000 transformations/month

### Optimization Tips
1. Use auto-quality and auto-format
2. Implement lazy loading for images
3. Use appropriate image sizes
4. Enable browser caching

## Advanced Features (Optional)

### AI-Powered Features
- Auto-tagging
- Content categorization
- Face detection for cropping
- Content moderation

### Video Features
- Adaptive bitrate streaming
- Video transcoding
- Subtitle support
- Video analytics

## Support

For issues with this setup:
1. Check Cloudinary documentation
2. Verify environment variables
3. Test upload presets in Cloudinary console
4. Check browser network tab for errors

## Next Steps

After setup:
1. Test all media types
2. Configure content moderation
3. Set up monitoring and analytics
4. Consider implementing advanced features