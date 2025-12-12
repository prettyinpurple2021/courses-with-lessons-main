import cloudinary from '../config/cloudinary.js';
import { logger } from './logger.js';

/**
 * Validate base64 image data
 * @param base64Data - Base64 encoded image data
 */
const validateBase64Image = (base64Data: string): void => {
  // Check if it's a valid base64 data URL
  const base64Regex = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
  
  if (!base64Regex.test(base64Data)) {
    throw new Error('Invalid image format. Only JPEG, PNG, GIF, and WebP are allowed');
  }
  
  // Extract base64 content and check size (approximate)
  const base64Content = base64Data.split(',')[1];
  const sizeInBytes = (base64Content.length * 3) / 4;
  const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
  
  if (sizeInBytes > maxSizeInBytes) {
    throw new Error('Image size exceeds maximum allowed size of 5MB');
  }
};

/**
 * Upload image to Cloudinary
 * @param base64Data - Base64 encoded image data
 * @param folder - Cloudinary folder to store the image
 * @returns Cloudinary URL of the uploaded image
 */
export const uploadImageToCloudinary = async (
  base64Data: string,
  folder: string = 'avatars'
): Promise<string> => {
  try {
    // Validate image before upload
    validateBase64Image(base64Data);
    
    const result = await cloudinary.uploader.upload(base64Data, {
      folder: `solosuccess-intel-academy/${folder}`,
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
      // Additional security options
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    });

    return result.secure_url;
  } catch (error) {
    logger.error('Cloudinary upload error', { error });
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to upload image to cloud storage');
  }
};

/**
 * Delete image from Cloudinary
 * @param imageUrl - Cloudinary URL of the image to delete
 */
export const deleteImageFromCloudinary = async (imageUrl: string): Promise<void> => {
  try {
    // Extract public_id from URL
    const urlParts = imageUrl.split('/');
    const filename = urlParts[urlParts.length - 1];
    const publicId = `solosuccess-intel-academy/avatars/${filename.split('.')[0]}`;

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    logger.error('Cloudinary delete error', { error, publicId });
    // Don't throw error, just log it
  }
};

/**
 * Check if Cloudinary is configured
 */
export const isCloudinaryConfigured = (): boolean => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};
