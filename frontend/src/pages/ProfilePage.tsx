import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../services/profileService';
import { getUserCertificates } from '../services/certificateService';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../contexts/ToastContext';
import CamoBackground from '../components/common/CamoBackground';
import GlassmorphicCard from '../components/common/GlassmorphicCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProfileHeader from '../components/profile/ProfileHeader';
import StatisticsGrid from '../components/profile/StatisticsGrid';
import AchievementGrid from '../components/profile/AchievementGrid';
import LearningPathVisualization from '../components/profile/LearningPathVisualization';
import ProfileEditForm from '../components/profile/ProfileEditForm';
import AvatarUpload from '../components/profile/AvatarUpload';

type EditMode = 'none' | 'profile' | 'avatar';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'progress' | 'certificates'>('overview');
  const [editMode, setEditMode] = useState<EditMode>('none');

  const {
    data: profileData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['profile'],
    queryFn: profileService.getProfile,
    enabled: !!user,
  });

  // Fetch user certificates
  const {
    data: certificates,
    isLoading: certificatesLoading,
  } = useQuery({
    queryKey: ['certificates'],
    queryFn: getUserCertificates,
    enabled: !!user,
  });

  // Mutation for updating profile
  const updateProfileMutation = useMutation({
    mutationFn: (data: { firstName: string; lastName: string; bio: string }) =>
      profileService.updateProfile(data),
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['profile'] });

      // Snapshot previous value
      const previousProfile = queryClient.getQueryData(['profile']);

      // Optimistically update
      queryClient.setQueryData(['profile'], (old: any) => ({
        ...old,
        user: {
          ...old.user,
          ...newData,
        },
      }));

      return { previousProfile };
    },
    onError: (_err, _newData, context) => {
      // Rollback on error
      if (context?.previousProfile) {
        queryClient.setQueryData(['profile'], context.previousProfile);
      }
      toast.error('Failed to update profile. Please try again.');
    },
    onSuccess: () => {
      toast.success('Profile updated successfully!');
      setEditMode('none');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  // Mutation for updating avatar
  const updateAvatarMutation = useMutation({
    mutationFn: (file: File) => profileService.updateAvatar(file),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['profile'] });
      const previousProfile = queryClient.getQueryData(['profile']);
      return { previousProfile };
    },
    onError: (_err, _file, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(['profile'], context.previousProfile);
      }
      toast.error('Failed to update avatar. Please try again.');
    },
    onSuccess: (data) => {
      // Update the profile data with new avatar
      queryClient.setQueryData(['profile'], (old: any) => ({
        ...old,
        user: {
          ...old.user,
          avatar: data.avatarUrl,
        },
      }));
      
      // Update auth store to propagate avatar change across all components
      if (user) {
        const authStore = useAuthStore.getState();
        authStore.setUser({
          ...user,
          avatar: data.avatarUrl,
        });
      }
      
      toast.success('Avatar updated successfully!');
      setEditMode('none');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const handleSaveProfile = async (data: { firstName: string; lastName: string; bio: string }) => {
    await updateProfileMutation.mutateAsync(data);
  };

  const handleUploadAvatar = async (file: File) => {
    await updateAvatarMutation.mutateAsync(file);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <CamoBackground variant="subtle" className="fixed inset-0 -z-10" />
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen relative">
        <CamoBackground variant="subtle" className="fixed inset-0 -z-10" />
        <div className="container mx-auto px-4 py-8">
          <GlassmorphicCard variant="elevated" className="p-8 text-center">
            <p className="text-white/70">Failed to load profile. Please try again later.</p>
          </GlassmorphicCard>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Statistics Section */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Your Statistics</h2>
              <StatisticsGrid statistics={profileData.statistics} />
            </section>

            {/* Learning Path Section */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Learning Path</h2>
              <LearningPathVisualization courseProgress={profileData.courseProgress} />
            </section>

            {/* Recent Achievements */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Recent Achievements</h2>
              <AchievementGrid
                achievements={profileData.achievements.slice(0, 6)}
                showAll={false}
              />
              {profileData.achievements.length > 6 && (
                <button
                  onClick={() => setActiveTab('achievements')}
                  className="mt-4 text-hot-pink hover:text-hot-pink/80 transition-colors font-semibold"
                >
                  View All Achievements →
                </button>
              )}
            </section>
          </div>
        );

      case 'achievements':
        return (
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">All Achievements</h2>
            <AchievementGrid achievements={profileData.achievements} showAll={true} />
          </section>
        );

      case 'progress':
        return (
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Course Progress</h2>
            <LearningPathVisualization courseProgress={profileData.courseProgress} detailed={true} />
          </section>
        );

      case 'certificates':
        return (
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">My Certificates</h2>
            {certificatesLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="md" />
              </div>
            ) : certificates && certificates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certificates.map((cert) => (
                  <GlassmorphicCard
                    key={cert.id}
                    variant="elevated"
                    className="p-6 cursor-pointer hover:scale-105 transition-transform border-2 border-girly-pink"
                    onClick={() => navigate(`/certificates/${cert.id}`)}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3">🏆</div>
                      <h3 className="text-lg font-bold text-hot-pink mb-2">
                        {cert.course?.title}
                      </h3>
                      <p className="text-sm text-white/70 mb-3">
                        Course {cert.course?.courseNumber}
                      </p>
                      <div className="holographic-border rounded-full px-3 py-1 inline-block mb-3">
                        <span className="text-xs text-success-teal font-bold">★ VERIFIED ★</span>
                      </div>
                      <p className="text-xs text-white/60">
                        Issued: {new Date(cert.issuedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </GlassmorphicCard>
                ))}
              </div>
            ) : (
              <GlassmorphicCard variant="default" className="p-8 text-center">
                <div className="text-6xl mb-4">📜</div>
                <p className="text-white/70 text-lg mb-2">No certificates yet</p>
                <p className="text-white/50 text-sm">
                  Complete a course to earn your first certificate!
                </p>
              </GlassmorphicCard>
            )}
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Camo Background */}
      <CamoBackground variant="subtle" className="fixed inset-0 -z-10" />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Edit Mode: Profile Edit Form */}
        {editMode === 'profile' && (
          <div className="mb-6">
            <ProfileEditForm
              user={profileData.user}
              onSave={handleSaveProfile}
              onCancel={() => setEditMode('none')}
              isSaving={updateProfileMutation.isPending}
            />
          </div>
        )}

        {/* Edit Mode: Avatar Upload */}
        {editMode === 'avatar' && (
          <div className="mb-6">
            <AvatarUpload
              user={profileData.user}
              onUpload={handleUploadAvatar}
              onCancel={() => setEditMode('none')}
              isUploading={updateAvatarMutation.isPending}
            />
          </div>
        )}

        {/* Profile Header with Edit Buttons */}
        {editMode === 'none' && (
          <div className="relative">
            <ProfileHeader user={profileData.user} statistics={profileData.statistics} />
            
            {/* Edit Buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() => setEditMode('avatar')}
                className="
                  px-4 py-2 rounded-lg font-semibold text-sm
                  glassmorphic text-white hover:text-hot-pink
                  border-2 border-white/20 hover:border-hot-pink
                  transition-all duration-300
                "
                title="Change Avatar"
              >
                📷
              </button>
              <button
                onClick={() => setEditMode('profile')}
                className="
                  px-4 py-2 rounded-lg font-semibold text-sm
                  glassmorphic text-white hover:text-hot-pink
                  border-2 border-white/20 hover:border-hot-pink
                  transition-all duration-300
                "
              >
                ✏️ Edit Profile
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="
                  px-4 py-2 rounded-lg font-semibold text-sm
                  glassmorphic text-white hover:text-hot-pink
                  border-2 border-white/20 hover:border-hot-pink
                  transition-all duration-300
                "
                title="Settings"
              >
                ⚙️ Settings
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mt-8 mb-6">
          <div className="glassmorphic rounded-lg p-2 inline-flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('overview')}
              className={`
                px-6 py-3 rounded-lg font-semibold transition-all duration-300
                ${
                  activeTab === 'overview'
                    ? 'bg-hot-pink text-white holographic-border'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }
              `}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`
                px-6 py-3 rounded-lg font-semibold transition-all duration-300
                ${
                  activeTab === 'achievements'
                    ? 'bg-hot-pink text-white holographic-border'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }
              `}
            >
              Achievements
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`
                px-6 py-3 rounded-lg font-semibold transition-all duration-300
                ${
                  activeTab === 'progress'
                    ? 'bg-hot-pink text-white holographic-border'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }
              `}
            >
              Progress
            </button>
            <button
              onClick={() => setActiveTab('certificates')}
              className={`
                px-6 py-3 rounded-lg font-semibold transition-all duration-300
                ${
                  activeTab === 'certificates'
                    ? 'bg-hot-pink text-white holographic-border'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }
              `}
            >
              Certificates
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6">{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default ProfilePage;
