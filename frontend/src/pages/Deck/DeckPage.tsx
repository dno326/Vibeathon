import React from 'react';
import Navbar from '../../components/layout/Navbar';
import PageContainer from '../../components/layout/PageContainer';
import EmptyState from '../../components/common/EmptyState';

const DeckPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <PageContainer>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Deck</h1>
          <p className="text-gray-600 mt-2">Manage and study this deck</p>
        </div>
        <EmptyState title="Coming soon" message="Deck management will be available here." />
      </PageContainer>
    </div>
  );
};

export default DeckPage;

