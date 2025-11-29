import React, { useState, useRef, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { UserProfile } from '../../types/profile';
import GlassmorphicCard from '../common/GlassmorphicCard';
import GlassmorphicButton from '../common/GlassmorphicButton';
import { createCroppedImage, blobToFile, readFileAsDataURL } from '../../utils/imageCrop';

interface AvatarUploadProps {
  user: UserProfile;
  onUpload: (file: File) => Promise<void>;
  onCancel: () => void;
  isUploading: boolean;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ user, onUpload, onCancel, isUploading }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [showCropper, setShowCropper] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setError('');

    try {
      const dataUrl = await readFileAsDataURL(file);
      setImageSrc(dataUrl);
      setShowCropper(true);
      setCroppedPreview(null);
    } catch (err) {
      setError('Failed to load image. Please try again.');
    }
  };

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      const croppedBlob = await createCroppedImage(imageSrc, croppedAreaPixels);
      const croppedUrl = URL.createObjectURL(croppedBlob);
      setCroppedPreview(croppedUrl);
      setShowCropper(false);
    } catch (err) {
      setError('Failed to crop image. Please try again.');
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      const croppedBlob = await createCroppedImage(imageSrc, croppedAreaPixels);
      const file = blobToFile(croppedBlob, `avatar-${Date.now()}.jpg`);
      await onUpload(file);
    } catch (err) {
      setError('Failed to upload avatar. Please try again.');
    }
  };

  const handleRemove = () => {
    setImageSrc(null);
    setCroppedPreview(null);
    setShowCropper(false);
    setError('');
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const currentAvatar = croppedPreview || user.avatar;

  return (
    <GlassmorphicCard variant="elevated" className="p-6 md:p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Change Avatar</h2>

      <div className="space-y-6">
        {/* Image Cropper */}
        {showCropper && imageSrc && (
          <div className="space-y-4">
            <div className="relative w-full h-80 glassmorphic rounded-lg overflow-hidden">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            {/* Zoom Control */}
            <div className="space-y-2">
              <label className="text-white text-sm font-semibold">Zoom</label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Crop Actions */}
            <div className="flex gap-4">
              <GlassmorphicButton
                onClick={handleCropConfirm}
                variant="primary"
                size="lg"
                className="flex-1"
              >
                Confirm Crop
              </GlassmorphicButton>
              <button
                onClick={handleCropCancel}
                className="
                  flex-1 px-6 py-3 rounded-lg font-semibold
                  glassmorphic text-white/70 hover:text-white
                  border-2 border-white/20 hover:border-white/40
                  transition-all duration-300
                "
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Avatar Preview (when not cropping) */}
        {!showCropper && (
          <>
            <div className="flex flex-col items-center">
              {currentAvatar ? (
                <img
                  src={currentAvatar}
                  alt="Avatar preview"
                  className="w-40 h-40 rounded-full border-4 border-hot-pink object-cover holographic-border"
                />
              ) : (
                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-hot-pink to-holographic-magenta flex items-center justify-center text-white text-6xl font-bold border-4 border-hot-pink">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
              )}

              {croppedPreview && (
                <p className="mt-3 text-sm text-success-teal font-semibold">
                  ✓ New avatar ready to upload
                </p>
              )}
            </div>

            {/* File Input */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="avatar-upload"
                disabled={isUploading}
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  block w-full px-6 py-3 rounded-lg font-semibold text-center
                  glassmorphic text-white border-2 border-white/20
                  hover:border-hot-pink hover:text-hot-pink
                  transition-all duration-300 cursor-pointer
                  ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {croppedPreview ? 'Choose Different Image' : 'Choose Image'}
              </label>
              <p className="mt-2 text-sm text-white/50 text-center">
                JPG, PNG or GIF. Max size 5MB.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="glassmorphic border-2 border-red-500 rounded-lg p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              {croppedPreview ? (
                <>
                  <GlassmorphicButton
                    onClick={handleUpload}
                    variant="primary"
                    size="lg"
                    disabled={isUploading}
                    loading={isUploading}
                    className="flex-1"
                  >
                    {isUploading ? 'Uploading...' : 'Upload Avatar'}
                  </GlassmorphicButton>
                  <button
                    onClick={handleRemove}
                    disabled={isUploading}
                    className="
                      flex-1 px-6 py-3 rounded-lg font-semibold
                      glassmorphic text-white/70 hover:text-white
                      border-2 border-white/20 hover:border-white/40
                      transition-all duration-300
                      disabled:opacity-50 disabled:cursor-not-allowed
                    "
                  >
                    Remove
                  </button>
                </>
              ) : (
                <button
                  onClick={onCancel}
                  disabled={isUploading}
                  className="
                    w-full px-6 py-3 rounded-lg font-semibold
                    glassmorphic text-white/70 hover:text-white
                    border-2 border-white/20 hover:border-white/40
                    transition-all duration-300
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                >
                  Cancel
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </GlassmorphicCard>
  );
};

export default AvatarUpload;
