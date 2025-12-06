import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { settingsService, NotificationPreferences, ChangePasswordData } from '../services/settingsService';
import { profileService } from '../services/profileService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';
import CamoBackground from '../components/common/CamoBackground';
import GlassmorphicCard from '../components/common/GlassmorphicCard';
import GlassmorphicButton from '../components/common/GlassmorphicButton';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const toast = useToast();
  
  // Password change state
  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    currentPassword: '',
    newPassword: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  // Fetch current notification preferences
  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: profileService.getProfile,
    enabled: !!user,
  });

  // Local state for notification preferences
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
    emailNotifications: profileData?.user?.emailNotifications ?? true,
    courseUpdates: profileData?.user?.courseUpdates ?? true,
    communityDigest: profileData?.user?.communityDigest ?? true,
    achievementAlerts: profileData?.user?.achievementAlerts ?? true,
  });

  // Update local state when profile data loads
  useState(() => {
    if (profileData?.user) {
      setNotificationPrefs({
        emailNotifications: profileData.user.emailNotifications,
        courseUpdates: profileData.user.courseUpdates,
        communityDigest: profileData.user.communityDigest,
        achievementAlerts: profileData.user.achievementAlerts,
      });
    }
  });

  // Password change mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordData) => settingsService.changePassword(data),
    onSuccess: () => {
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '' });
      setConfirmPassword('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to change password');
    },
  });

  // Notification preferences mutation
  const updateNotificationsMutation = useMutation({
    mutationFn: (prefs: Partial<NotificationPreferences>) =>
      settingsService.updateNotificationPreferences(prefs),
    onSuccess: () => {
      toast.success('Notification preferences updated!');
    },
    onError: () => {
      toast.error('Failed to update notification preferences');
    },
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: (password: string) => settingsService.deleteAccount({ password }),
    onSuccess: () => {
      toast.success('Account deleted successfully');
      logout();
      navigate('/');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to delete account');
    },
  });

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }

    if (passwordData.newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    changePasswordMutation.mutate(passwordData);
  };

  const handleNotificationToggle = (key: keyof NotificationPreferences) => {
    const newPrefs = {
      ...notificationPrefs,
      [key]: !notificationPrefs[key],
    };
    setNotificationPrefs(newPrefs);
    updateNotificationsMutation.mutate({ [key]: !notificationPrefs[key] });
  };

  const handleDeleteAccount = () => {
    if (!deletePassword) {
      toast.error('Please enter your password to confirm');
      return;
    }

    deleteAccountMutation.mutate(deletePassword);
  };

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <CamoBackground variant="subtle" className="fixed inset-0 -z-10" />
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Camo Background */}
      <CamoBackground variant="subtle" className="fixed inset-0 -z-10" />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => navigate('/profile')}
          className="
            mb-6 flex items-center gap-2 text-white/70 hover:text-white
            transition-colors duration-300
          "
        >
          <span className="text-xl">←</span>
          <span>Back to Profile</span>
        </button>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
          <p className="text-white/70">Manage your account preferences and security</p>
        </div>

        {/* Password Change Section */}
        <GlassmorphicCard variant="elevated" className="p-6 md:p-8 mb-6">
          <h2 className="text-2xl font-bold text-white mb-6">Change Password</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-white/90 mb-2 font-semibold">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
                className="
                  w-full px-4 py-3 rounded-lg
                  glassmorphic text-white
                  border-2 border-white/20
                  focus:border-hot-pink focus:outline-none
                  transition-all duration-300
                  placeholder-white/40
                "
                placeholder="Enter current password"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-white/90 mb-2 font-semibold">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
                className="
                  w-full px-4 py-3 rounded-lg
                  glassmorphic text-white
                  border-2 border-white/20
                  focus:border-hot-pink focus:outline-none
                  transition-all duration-300
                  placeholder-white/40
                "
                placeholder="Enter new password (min 8 characters)"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-white/90 mb-2 font-semibold">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="
                  w-full px-4 py-3 rounded-lg
                  glassmorphic text-white
                  border-2 border-white/20
                  focus:border-hot-pink focus:outline-none
                  transition-all duration-300
                  placeholder-white/40
                "
                placeholder="Confirm new password"
              />
            </div>

            <div className="pt-2">
              <GlassmorphicButton
                type="submit"
                variant="primary"
                loading={changePasswordMutation.isPending}
                disabled={changePasswordMutation.isPending}
              >
                Change Password
              </GlassmorphicButton>
            </div>
          </form>
        </GlassmorphicCard>

        {/* Notification Preferences Section */}
        <GlassmorphicCard variant="elevated" className="p-6 md:p-8 mb-6">
          <h2 className="text-2xl font-bold text-white mb-6">Notification Preferences</h2>
          <div className="space-y-4">
            {/* Email Notifications Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg glassmorphic-flat">
              <div>
                <h3 className="text-white font-semibold mb-1">Email Notifications</h3>
                <p className="text-white/60 text-sm">Receive general email notifications</p>
              </div>
              <button
                onClick={() => handleNotificationToggle('emailNotifications')}
                className={`
                  relative inline-flex h-8 w-14 items-center rounded-full
                  transition-all duration-300
                  ${
                    notificationPrefs.emailNotifications
                      ? 'bg-hot-pink holographic-glow'
                      : 'bg-white/20'
                  }
                `}
                disabled={updateNotificationsMutation.isPending}
              >
                <span
                  className={`
                    inline-block h-6 w-6 transform rounded-full bg-white
                    transition-transform duration-300
                    ${notificationPrefs.emailNotifications ? 'translate-x-7' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>

            {/* Course Updates Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg glassmorphic-flat">
              <div>
                <h3 className="text-white font-semibold mb-1">Course Updates</h3>
                <p className="text-white/60 text-sm">Get notified about new lessons and content</p>
              </div>
              <button
                onClick={() => handleNotificationToggle('courseUpdates')}
                className={`
                  relative inline-flex h-8 w-14 items-center rounded-full
                  transition-all duration-300
                  ${
                    notificationPrefs.courseUpdates
                      ? 'bg-hot-pink holographic-glow'
                      : 'bg-white/20'
                  }
                `}
                disabled={updateNotificationsMutation.isPending}
              >
                <span
                  className={`
                    inline-block h-6 w-6 transform rounded-full bg-white
                    transition-transform duration-300
                    ${notificationPrefs.courseUpdates ? 'translate-x-7' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>

            {/* Community Digest Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg glassmorphic-flat">
              <div>
                <h3 className="text-white font-semibold mb-1">Community Digest</h3>
                <p className="text-white/60 text-sm">Weekly summary of community activity</p>
              </div>
              <button
                onClick={() => handleNotificationToggle('communityDigest')}
                className={`
                  relative inline-flex h-8 w-14 items-center rounded-full
                  transition-all duration-300
                  ${
                    notificationPrefs.communityDigest
                      ? 'bg-hot-pink holographic-glow'
                      : 'bg-white/20'
                  }
                `}
                disabled={updateNotificationsMutation.isPending}
              >
                <span
                  className={`
                    inline-block h-6 w-6 transform rounded-full bg-white
                    transition-transform duration-300
                    ${notificationPrefs.communityDigest ? 'translate-x-7' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>

            {/* Achievement Alerts Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg glassmorphic-flat">
              <div>
                <h3 className="text-white font-semibold mb-1">Achievement Alerts</h3>
                <p className="text-white/60 text-sm">Get notified when you unlock achievements</p>
              </div>
              <button
                onClick={() => handleNotificationToggle('achievementAlerts')}
                className={`
                  relative inline-flex h-8 w-14 items-center rounded-full
                  transition-all duration-300
                  ${
                    notificationPrefs.achievementAlerts
                      ? 'bg-hot-pink holographic-glow'
                      : 'bg-white/20'
                  }
                `}
                disabled={updateNotificationsMutation.isPending}
              >
                <span
                  className={`
                    inline-block h-6 w-6 transform rounded-full bg-white
                    transition-transform duration-300
                    ${notificationPrefs.achievementAlerts ? 'translate-x-7' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>
          </div>
        </GlassmorphicCard>

        {/* Data & Privacy Section */}
        <GlassmorphicCard variant="elevated" className="p-6 md:p-8 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Data & Privacy</h2>
          <p className="text-white/70 mb-6">
            Download a copy of all your personal data or learn more about how we handle your information.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <GlassmorphicButton
              variant="outline"
              onClick={async () => {
                try {
                  toast.info('Preparing your data export...');
                  const exportedData = await settingsService.exportData();
                  
                  // Create and download the JSON file
                  const blob = new Blob([JSON.stringify(exportedData, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `my-data-export-${new Date().toISOString().split('T')[0]}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  
                  toast.success('Your data has been exported!');
                } catch (error) {
                  toast.error('Failed to export data. Please try again.');
                }
              }}
              className="border-hot-pink/50 text-hot-pink hover:bg-hot-pink/20"
            >
              📥 Export My Data
            </GlassmorphicButton>
            
            <GlassmorphicButton
              variant="outline"
              onClick={() => navigate('/privacy')}
            >
              📄 Privacy Policy
            </GlassmorphicButton>
          </div>
        </GlassmorphicCard>

        {/* Danger Zone - Delete Account */}
        <GlassmorphicCard variant="elevated" className="p-6 md:p-8 border-2 border-red-500/30">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Danger Zone</h2>
          <p className="text-white/70 mb-6">
            Once you delete your account, there is no going back. This action cannot be undone.
          </p>

          {!showDeleteConfirm ? (
            <GlassmorphicButton
              variant="outline"
              onClick={() => setShowDeleteConfirm(true)}
              className="border-red-500/50 text-red-400 hover:bg-red-500/20"
            >
              Delete Account
            </GlassmorphicButton>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                <p className="text-red-400 font-semibold mb-2">⚠️ Are you absolutely sure?</p>
                <p className="text-white/70 text-sm">
                  This will permanently delete your account, all your progress, certificates, and
                  achievements. This action cannot be undone.
                </p>
              </div>

              <div>
                <label htmlFor="deletePassword" className="block text-white/90 mb-2 font-semibold">
                  Enter your password to confirm
                </label>
                <input
                  type="password"
                  id="deletePassword"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="
                    w-full px-4 py-3 rounded-lg
                    glassmorphic text-white
                    border-2 border-red-500/30
                    focus:border-red-500 focus:outline-none
                    transition-all duration-300
                    placeholder-white/40
                  "
                  placeholder="Enter your password"
                />
              </div>

              <div className="flex gap-3">
                <GlassmorphicButton
                  variant="outline"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeletePassword('');
                  }}
                  disabled={deleteAccountMutation.isPending}
                >
                  Cancel
                </GlassmorphicButton>
                <GlassmorphicButton
                  variant="primary"
                  onClick={handleDeleteAccount}
                  loading={deleteAccountMutation.isPending}
                  disabled={deleteAccountMutation.isPending}
                  className="bg-red-500/30 hover:bg-red-500/40 border-red-500/50"
                >
                  Yes, Delete My Account
                </GlassmorphicButton>
              </div>
            </div>
          )}
        </GlassmorphicCard>
      </div>
    </div>
  );
}