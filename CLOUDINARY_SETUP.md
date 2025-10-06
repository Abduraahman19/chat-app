# Cloudinary Setup Guide

## 1. Create Cloudinary Account
1. Go to [Cloudinary](https://cloudinary.com/) and sign up for a free account
2. After registration, you'll be redirected to your dashboard

## 2. Get Your Credentials
From your Cloudinary dashboard, copy these values:
- **Cloud Name**: Found in the top-left corner
- **API Key**: Found in the "Account Details" section
- **API Secret**: Found in the "Account Details" section (click the eye icon to reveal)

## 3. Update Environment Variables
Replace the placeholder values in your `.env.local` file:

```env
# Replace these with your actual Cloudinary credentials
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret
```

## 4. Create Upload Preset (Optional but Recommended)
1. In your Cloudinary dashboard, go to **Settings** → **Upload**
2. Scroll down to **Upload presets**
3. Click **Add upload preset**
4. Set the following:
   - **Preset name**: `profile_pictures`
   - **Signing Mode**: `Unsigned`
   - **Folder**: `chat-app/profiles`
   - **Transformation**: 
     - Width: 400
     - Height: 400
     - Crop: Fill
     - Gravity: Face
   - **Format**: Auto
   - **Quality**: Auto
5. Save the preset

## 5. Features Included

### ✅ Professional Image Processing
- Automatic face detection and cropping
- Smart resizing to 400x400 pixels
- Format optimization (WebP when supported)
- Quality optimization for faster loading

### ✅ User Experience
- Drag and drop upload
- Real-time upload progress
- File validation (type and size)
- Error handling with user-friendly messages

### ✅ Security
- Server-side upload handling
- File type validation
- Size limits (5MB max)
- Secure API endpoints

### ✅ Performance
- Automatic format conversion
- CDN delivery
- Responsive images
- Lazy loading support

## 6. Usage
Once configured, users can:
1. Click "Edit Profile"
2. Click on their profile picture
3. Either drag & drop an image or click to select
4. Image is automatically processed and uploaded
5. Profile updates with the new picture

## 7. Troubleshooting

### Common Issues:
1. **Upload fails**: Check your API credentials
2. **Images don't load**: Verify your cloud name
3. **Large files rejected**: Default limit is 5MB
4. **Wrong format**: Only JPG, PNG, WebP allowed

### Testing:
1. Try uploading a small test image
2. Check the browser console for errors
3. Verify the image appears in your Cloudinary media library

## 8. Cost Considerations
- Free tier includes 25GB storage and 25GB bandwidth
- Transformations: 25,000 per month
- Perfect for small to medium applications
- Monitor usage in Cloudinary dashboard