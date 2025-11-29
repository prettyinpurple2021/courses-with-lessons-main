import React, { useState } from 'react';
import { UserProfile } from '../../types/profile';
import GlassmorphicCard from '../common/GlassmorphicCard';
import GlassmorphicButton from '../common/GlassmorphicButton';

interface ProfileEditFormProps {
  user: UserProfile;
  onSave: (data: { firstName: string; lastName: string; bio: string }) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ user, onSave, onCancel, isSaving }) => {
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    bio: user.bio || '',
  });

  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    bio?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    if (formData.bio.length > 500) {
      newErrors.bio = 'Bio must be 500 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await onSave({
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      bio: formData.bio.trim(),
    });
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <GlassmorphicCard variant="elevated" className="p-6 md:p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Edit Profile</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* First Name */}
        <div>
          <label htmlFor="firstName" className="block text-white font-semibold mb-2">
            First Name <span className="text-hot-pink">*</span>
          </label>
          <input
            type="text"
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            className={`
              w-full px-4 py-3 rounded-lg
              glassmorphic text-white placeholder-white/50
              border-2 transition-all duration-300
              focus:outline-none focus:ring-2 focus:ring-hot-pink
              ${errors.firstName ? 'border-red-500' : 'border-white/20'}
            `}
            placeholder="Enter your first name"
            disabled={isSaving}
          />
          {errors.firstName && (
            <p className="mt-2 text-sm text-red-400">{errors.firstName}</p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="lastName" className="block text-white font-semibold mb-2">
            Last Name <span className="text-hot-pink">*</span>
          </label>
          <input
            type="text"
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            className={`
              w-full px-4 py-3 rounded-lg
              glassmorphic text-white placeholder-white/50
              border-2 transition-all duration-300
              focus:outline-none focus:ring-2 focus:ring-hot-pink
              ${errors.lastName ? 'border-red-500' : 'border-white/20'}
            `}
            placeholder="Enter your last name"
            disabled={isSaving}
          />
          {errors.lastName && (
            <p className="mt-2 text-sm text-red-400">{errors.lastName}</p>
          )}
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-white font-semibold mb-2">
            Bio
          </label>
          <textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            rows={4}
            className={`
              w-full px-4 py-3 rounded-lg
              glassmorphic text-white placeholder-white/50
              border-2 transition-all duration-300
              focus:outline-none focus:ring-2 focus:ring-hot-pink
              resize-none
              ${errors.bio ? 'border-red-500' : 'border-white/20'}
            `}
            placeholder="Tell us about yourself..."
            disabled={isSaving}
          />
          <div className="mt-2 flex justify-between items-center">
            {errors.bio ? (
              <p className="text-sm text-red-400">{errors.bio}</p>
            ) : (
              <p className="text-sm text-white/50">
                {formData.bio.length}/500 characters
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <GlassmorphicButton
            type="submit"
            variant="primary"
            size="lg"
            disabled={isSaving}
            loading={isSaving}
            className="flex-1"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </GlassmorphicButton>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="
              flex-1 px-6 py-3 rounded-lg font-semibold
              glassmorphic text-white/70 hover:text-white
              border-2 border-white/20 hover:border-white/40
              transition-all duration-300
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            Cancel
          </button>
        </div>
      </form>
    </GlassmorphicCard>
  );
};

export default ProfileEditForm;
