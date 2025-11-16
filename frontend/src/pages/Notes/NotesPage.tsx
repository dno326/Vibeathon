import React, { useEffect, useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import EmptyState from '../../components/common/EmptyState';
import CreateNoteModal from '../../components/notes/CreateNoteModal';
import { notesApi } from '../../lib/notesApi';
import NoteList from '../../components/notes/NoteList';
import { useAuth } from '../../hooks/useAuth';

const NotesPage: React.FC = () => {
  const { user } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [notes, setNotes] = useState<Array<{ id: string; content: string; created_at: string; public: boolean; author?: any; cls?: any }>>([]);
  const [loading, setLoading] = useState(true);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const mine = await notesApi.getNotes();
      setNotes(mine);
    } catch (e) {
      // noop
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const handleCreated = () => {
    loadNotes();
  };

  const handleDelete = async (noteId: string) => {
    try {
      await notesApi.deleteNote(noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Notes</h1>
            <p className="text-gray-600 mt-2">Create and manage your notes, or add them to classes</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            Create Note
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Loading notes...</p>
          </div>
        ) : notes.length === 0 ? (
          <EmptyState
            title="No notes yet"
            message="Create your first note or add an existing note to a class to get started."
            actionLabel="Create Note"
            onAction={() => setShowCreate(true)}
          />
        ) : (
          <NoteList notes={notes as any} currentUserId={user?.id} onDelete={handleDelete} />
        )}
      </div>

      <CreateNoteModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={handleCreated}
      />
    </div>
  );
};

export default NotesPage;

