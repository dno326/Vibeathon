import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { classApi } from '../../lib/classApi';
import { Class } from '../../types/classes';
import Navbar from '../../components/layout/Navbar';
import ClassCard from '../../components/classes/ClassCard';
import ClassList from '../../components/classes/ClassList';
import JoinClassModal from '../../components/classes/JoinClassModal';
import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import Spinner from '../../components/common/Spinner';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<(Class & { user_role?: string })[]>([]);
  const [loading, setLoading] = useState(true);
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

  const handleClassJoined = () => {
    loadClasses();
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <PageContainer>
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome Back, {user?.first_name || 'there'}!
            </h1>
          <p className="text-lg text-gray-600">Here's a quick overview of your activity</p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Link
            to="/notes"
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 p-8 border border-gray-100 hover:border-purple-300 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <svg
                className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transform group-hover:translate-x-1 transition-all"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
              My Notes
            </h3>
            <p className="text-gray-600">View and manage all your notes</p>
          </Link>

          <Link
            to="/flashcards"
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 p-8 border border-gray-100 hover:border-purple-300 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-violet-100 rounded-xl group-hover:bg-violet-200 transition-colors">
                <svg
                  className="w-8 h-8 text-violet-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <svg
                className="w-5 h-5 text-gray-400 group-hover:text-violet-600 transform group-hover:translate-x-1 transition-all"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
          </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-violet-600 transition-colors">
              My Flashcards
            </h3>
            <p className="text-gray-600">Study with your flashcard decks</p>
          </Link>
      </div>

        {/* Recent Classes Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Classes</h2>
            <Button variant="secondary" onClick={() => setShowJoinModal(true)}>
              Browse & Join Classes
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner />
            <p className="ml-3 text-gray-600">Loading classes...</p>
          </div>
        ) : classes.length === 0 ? (
          <EmptyState
            title="No classes yet"
            message="Browse the catalog and join a class to get started."
            actionLabel="Browse & Join Classes"
            onAction={() => setShowJoinModal(true)}
          />
        ) : (
          <ClassList classes={classes} />
        )}
      </PageContainer>

      {/* Join Modal */}
      <JoinClassModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSuccess={handleClassJoined}
      />
    </div>
  );
};

export default DashboardPage;
