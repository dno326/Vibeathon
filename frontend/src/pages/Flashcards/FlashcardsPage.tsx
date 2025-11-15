import React from 'react';
import Navbar from '../../components/layout/Navbar';
import EmptyState from '../../components/common/EmptyState';

const FlashcardsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Flashcards</h1>
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
      </div>
    </div>
  );
};

export default FlashcardsPage;

