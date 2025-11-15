import React from 'react';
import Navbar from '../../components/layout/Navbar';
import EmptyState from '../../components/common/EmptyState';

const NotesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Notes</h1>
          <p className="text-gray-600 mt-2">Create and manage your notes, or add them to classes</p>
        </div>

        <EmptyState
          title="No notes yet"
          message="Create your first note or add an existing note to a class to get started."
          actionLabel="Create Note"
          onAction={() => {
            // TODO: Implement create note functionality
            console.log('Create note clicked');
          }}
        />
      </div>
    </div>
  );
};

export default NotesPage;

