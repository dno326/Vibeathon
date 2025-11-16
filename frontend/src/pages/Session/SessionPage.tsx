import React from 'react';
import Navbar from '../../components/layout/Navbar';
import PageContainer from '../../components/layout/PageContainer';
import EmptyState from '../../components/common/EmptyState';

const SessionPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <PageContainer>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Session</h1>
          <p className="text-gray-600 mt-2">Record or upload a session to generate study materials</p>
        </div>
        <EmptyState
          title="No session yet"
          message="Start a recording or upload audio to create a new study session."
          actionLabel="Start Session"
          onAction={() => {}}
        />
      </PageContainer>
    </div>
  );
};

export default SessionPage;

