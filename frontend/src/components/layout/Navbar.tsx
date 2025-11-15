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
    <nav className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              MountainMerge
            </h1>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            <Link
              to="/profile"
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isActive('/profile')
                  ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white'
                  : 'text-gray-700 hover:bg-purple-50'
              }`}
            >
              Profile
            </Link>
            <Link
              to="/dashboard"
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isActive('/dashboard')
                  ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white'
                  : 'text-gray-700 hover:bg-purple-50'
              }`}
            >
              Classes
            </Link>
            <Link
              to="/notes"
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isActive('/notes')
                  ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white'
                  : 'text-gray-700 hover:bg-purple-50'
              }`}
            >
              Notes
            </Link>
            <Link
              to="/flashcards"
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isActive('/flashcards')
                  ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white'
                  : 'text-gray-700 hover:bg-purple-50'
              }`}
            >
              Flashcards
            </Link>
            <button
              onClick={handleLogout}
              className="ml-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold rounded-lg hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
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
