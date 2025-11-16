import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { classApi } from '../../lib/classApi';
import { Class } from '../../types/classes';
import ClassList from '../../components/classes/ClassList';
import JoinClassModal from '../../components/classes/JoinClassModal';
import Navbar from '../../components/layout/Navbar';
import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import Spinner from '../../components/common/Spinner';

const ClassesPage: React.FC = () => {
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">My Classes</h2>
            <p className="text-gray-600 mt-1">All the classes you’ve joined</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowJoinModal(true)}>
              Browse & Join Classes
            </Button>
          </div>
        </div>

        {/* Classes content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner />
            <p className="ml-3 text-gray-600">Loading classes...</p>
          </div>
        ) : classes.length === 0 ? (
          <EmptyState
            title="No classes yet"
            message="Browse the catalog and join your first class to get started."
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

export default ClassesPage;

