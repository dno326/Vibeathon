import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { classApi } from '../../lib/classApi';
import { Class } from '../../types/classes';
import ClassList from '../../components/classes/ClassList';
import CreateClassModal from '../../components/classes/CreateClassModal';
import JoinClassModal from '../../components/classes/JoinClassModal';
import Navbar from '../../components/layout/Navbar';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<(Class & { user_role?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const userClasses = await classApi.getClasses();
      setClasses(userClasses);
    } catch (error) {
      console.error('Failed to load classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClassCreated = () => {
    loadClasses();
  };

  const handleClassJoined = () => {
    loadClasses();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      <Navbar />

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-800">My Classes</h2>
            <div className="flex gap-3">
              <button
                onClick={() => setShowJoinModal(true)}
                className="px-4 py-2 border-2 border-purple-600 text-purple-600 font-semibold rounded-xl hover:bg-purple-50 transition-all"
              >
                Join Class
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                Create Class
              </button>
            </div>
          </div>
        </div>

        {/* Classes content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Loading classes...</p>
          </div>
        ) : classes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No classes yet</h3>
              <p className="text-gray-600 mb-6">
                Get started by creating your first class or joining an existing one with a class code.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="px-6 py-2 border-2 border-purple-600 text-purple-600 font-semibold rounded-xl hover:bg-purple-50 transition-all"
                >
                  Join Class
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                  Create Class
                </button>
              </div>
            </div>
          </div>
        ) : (
          <ClassList classes={classes} />
        )}
      </div>

      {/* Modals */}
      <CreateClassModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleClassCreated}
      />
      <JoinClassModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSuccess={handleClassJoined}
      />
    </div>
  );
};

export default DashboardPage;
