import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface DashboardHeaderProps {
  achievementLevel?: number;
}

export default function DashboardHeader({ achievementLevel = 1 }: DashboardHeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getAchievementTitle = (level: number): string => {
    if (level >= 7) return 'Boss Commander';
    if (level >= 5) return 'Squad Leader';
    if (level >= 3) return 'Sergeant';
    return 'Recruit';
  };

  const getInitials = (firstName?: string, lastName?: string): string => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  };

  return (
    <header className="glassmorphic rounded-lg p-4 md:p-6 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* User Info */}
        <div className="flex items-center gap-4">
          {/* Avatar with Achievement Level */}
          <div className="relative">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full glassmorphic-elevated flex items-center justify-center text-2xl md:text-3xl font-bold text-white holographic-border">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span>{getInitials(user?.firstName, user?.lastName)}</span>
              )}
            </div>
            
            {/* Achievement Level Badge */}
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-hot-pink glassmorphic-elevated flex items-center justify-center text-white text-sm font-bold holographic-border">
              {achievementLevel}
            </div>
          </div>

          {/* User Details */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-white/70 text-sm md:text-base mt-1">
              {getAchievementTitle(achievementLevel)} • Level {achievementLevel}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/profile')}
            className="glassmorphic px-4 py-2 rounded-lg text-white hover:glassmorphic-elevated transition-all duration-200"
          >
            Profile
          </button>
          <button
            onClick={handleLogout}
            className="glassmorphic px-4 py-2 rounded-lg text-white hover:glassmorphic-elevated transition-all duration-200"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
