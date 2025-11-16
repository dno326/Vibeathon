import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav className="bg-[#f6ede5] text-[#4b2f23] border-b border-white/40 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-primary-700 to-accent-500 text-white shadow-soft group-hover:shadow-card transition-all duration-200">
              {/* Mountain logo */}
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M3 18h18l-6.5-9.5-3 4-2-3L3 18z" />
              </svg>
            </span>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">
              MountainMerge
            </h1>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            <Link
              to="/classes"
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isActive('/classes')
                  ? 'bg-white/60 text-[#4b2f23]'
                  : 'text-[#4b2f23]/80 hover:bg-white/60'
              }`}
            >
              Classes
            </Link>
            <Link
              to="/notes"
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isActive('/notes')
                  ? 'bg-white/60 text-[#4b2f23]'
                  : 'text-[#4b2f23]/80 hover:bg-white/60'
              }`}
            >
              Notes
            </Link>
            <Link
              to="/flashcards"
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isActive('/flashcards')
                  ? 'bg-white/60 text-[#4b2f23]'
                  : 'text-[#4b2f23]/80 hover:bg-white/60'
              }`}
            >
              Flashcards
            </Link>
            <Link
              to="/profile"
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isActive('/profile')
                  ? 'bg-white/60 text-[#4b2f23]'
                  : 'text-[#4b2f23]/80 hover:bg-white/60'
              }`}
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="ml-4 px-4 py-2 bg-[#4b2f23] text-white font-semibold rounded-lg hover:shadow-lg hover:brightness-110 active:scale-95 transition-all duration-200"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
