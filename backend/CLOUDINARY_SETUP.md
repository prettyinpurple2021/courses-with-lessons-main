# Cloudinary Setup Guide

This guide explains how to set up Cloudinary for avatar and image storage in the SoloSuccess Intel Academy platform.

## Why Cloudinary?

Cloudinary provides:
- Automatic image optimization and transformation
- CDN delivery for fast loading
- Automatic format conversion (WebP, AVIF)
- Face detection for smart cropping
- Free tier with generous limits

## Setup Steps

### 1. Create a Cloudinary Account

1. Go to [https://cloudinary.com/](https://cloudinary.com/)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your Credentials

1. Log in to your Cloudinary dashboard
2. Navigate to the Dashboard home page
3. You'll see your credentials:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### 3. Configure Environment Variables

Add the following to your `.env` file in the backend directory:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Replace the values with your actual Cloudinary credentials.

### 4. Test the Configuration

Start the backend server and try uploading an avatar through the profile page. The image should be uploaded to Cloudinary and the URL should be stored in the database.

## Fallback Behavior

If Cloudinary is not configured (missing environment variables), the system will fall back to storing base64-encoded images directly in the database. This is not recommended for production but works for development.

## Cloudinary Features U