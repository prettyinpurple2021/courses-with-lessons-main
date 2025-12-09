import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import GlassmorphicButton from '../common/GlassmorphicButton';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="relative z-50">
      <div className="glassmorphic border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo */}
            <Link 
              to={user ? '/dashboard' : '/'} 
              className="flex items-center space-x-2"
              onClick={closeMobileMenu}
            >
              <span className="text-xl md:text-2xl font-headline font-bold text-white">
                SoloSuccess
              </span>
              <span className="text-xl md:text-2xl font-headline font-bold text-cyan-400">
                Intel
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {user ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="text-white hover:text-cyan-400 transition-colors font-semibold"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/community" 
                    className="text-white hover:text-cyan-400 transition-colors font-semibold"
                  >
                    Community
                  </Link>
                  <Link 
                    to="/profile" 
                    className="text-white hover:text-cyan-400 transition-colors font-semibold"
                  >
                    Profile
                  </Link>
                  <GlassmorphicButton
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                  >
                    Logout
                  </GlassmorphicButton>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <GlassmorphicButton variant="outline" size="sm">
                      Sign In
                    </GlassmorphicButton>
                  </Link>
                  <Link to="/register">
                    <GlassmorphicButton variant="primary" size="sm">
                      Get Started
                    </GlassmorphicButton>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg glassmorphic text-white hover:text-cyan-400 transition-colors"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div 
          id="mobile-menu"
          className="md:hidden absolute top-full left-0 right-0 glassmorphic border-b border-white/10 shadow-glass"
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="px-4 py-4 space-y-3">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="block px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-colors font-semibold"
                  onClick={closeMobileMenu}
                >
                  Dashboard
                </Link>
                <Link
                  to="/community"
                  className="block px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-colors font-semibold"
                  onClick={closeMobileMenu}
                >
                  Community
                </Link>
                <Link
                  to="/profile"
                  className="block px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-colors font-semibold"
                  onClick={closeMobileMenu}
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-colors font-semibold"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-colors font-semibold text-center"
                  onClick={closeMobileMenu}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block"
                  onClick={closeMobileMenu}
                >
                  <GlassmorphicButton variant="primary" size="md" className="w-full">
                    Get Started
                  </GlassmorphicButton>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
