import { useState } from 'react';
import { DashboardTab } from '../../types/dashboard';

interface DashboardNavProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}

const tabs: { id: DashboardTab; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'courses', label: 'My Courses', icon: '📚' },
  { id: 'achievements', label: 'Achievements', icon: '🏆' },
  { id: 'community', label: 'Community', icon: '👥' },
];

export default function DashboardNav({ activeTab, onTabChange }: DashboardNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="relative">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden w-full glassmorphic p-4 mb-4 flex items-center justify-between"
        aria-label="Toggle navigation menu"
      >
        <span className="text-white font-semibold">
          {tabs.find((t) => t.id === activeTab)?.label}
        </span>
        <span className="text-2xl">{mobileMenuOpen ? '✕' : '☰'}</span>
      </button>

      {/* Desktop Navigation */}
      <div className="hidden md:flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative px-6 py-3 rounded-lg font-semibold transition-all duration-300
              ${
                activeTab === tab.id
                  ? 'glassmorphic-elevated holographic-border text-white'
                  : 'glassmorphic text-white/70 hover:text-white hover:glassmorphic-elevated'
              }
            `}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            {/* Camo underlay for active tab */}
            {activeTab === tab.id && (
              <div className="absolute inset-0 camo-background opacity-10 rounded-lg -z-10" />
            )}
            
            <span className="flex items-center gap-2">
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.label}</span>
            </span>

            {/* Holographic lighting effect for active tab */}
            {activeTab === tab.id && (
              <div className="absolute inset-0 holographic opacity-30 rounded-lg pointer-events-none" />
            )}
          </button>
        ))}
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden glassmorphic rounded-lg overflow-hidden mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                onTabChange(tab.id);
                setMobileMenuOpen(false);
              }}
              className={`
                w-full px-6 py-4 text-left transition-all duration-200
                ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white font-semibold'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              <span className="flex items-center gap-3">
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.label}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
