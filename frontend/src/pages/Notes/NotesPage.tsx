import React, { useEffect, useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import EmptyState from '../../components/common/EmptyState';
import CreateNoteModal from '../../components/notes/CreateNoteModal';
import { notesApi } from '../../lib/notesApi';
import NoteList from '../../components/notes/NoteList';
import { useAuth } from '../../hooks/useAuth';
import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';

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
    <div className="min-h-screen">
      <Navbar />
      
      <PageContainer>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Notes</h1>
            <p className="text-gray-600 mt-2">Create and manage your notes, or add them to classes</p>
          </div>
          <Button onClick={() => setShowCreate(true)}>Create Note</Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner />
            <p className="ml-3 text-gray-600">Loading notes...</p>
          </div>
        ) : notes.length === 0 ? (
          <EmptyState
            title="No notes yet"
            message="Create your first note or add an existing note to a class to get started."
            actionLabel="Create Note"
            onAction={() => setShowCreate(true)}
          />
        ) : (
          <NoteList notes={notes as any} currentUserId={user?.id} onDelete={handleDelete} backTo="/notes" />
        )}
      </PageContainer>

      <CreateNoteModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={handleCreated}
      />
    </div>
  );
};

export default NotesPage;

