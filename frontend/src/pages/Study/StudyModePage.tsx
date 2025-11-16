import React from 'react';
import Navbar from '../../components/layout/Navbar';
import PageContainer from '../../components/layout/PageContainer';
import EmptyState from '../../components/common/EmptyState';

const StudyModePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <PageContainer>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Study Mode</h1>
          <p className="text-gray-600 mt-2">Practice with spaced repetition and quick drills</p>
        </div>
        <EmptyState title="No active study session" message="Choose a deck to begin a study session." actionLabel="Browse Decks" onAction={()=>{}} />
      </PageContainer>
    </div>
  );
};

export default StudyModePage;

