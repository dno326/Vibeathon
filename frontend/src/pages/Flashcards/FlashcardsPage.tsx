import React from 'react';
import Navbar from '../../components/layout/Navbar';
import EmptyState from '../../components/common/EmptyState';
import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/common/Button';

const FlashcardsPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <PageContainer>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Flashcards</h1>
          <p className="text-gray-600 mt-2">Create and manage your flashcard decks, or add them to classes</p>
        </div>

        <EmptyState
          title="No flashcard decks yet"
          message="Create your first flashcard deck or add an existing deck to a class to get started."
          actionLabel="Create Deck"
          onAction={() => {
            // TODO: Implement create deck functionality
            console.log('Create deck clicked');
          }}
        />
      </PageContainer>
    </div>
  );
};

export default FlashcardsPage;

