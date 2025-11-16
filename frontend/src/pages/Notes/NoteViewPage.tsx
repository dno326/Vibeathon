import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { notesApi } from '../../lib/notesApi';
import { formatDate } from '../../utils/formatDate';

const NoteViewPage: React.FC = () => {
  const { noteId } = useParams<{ noteId: string }>();
  const [note, setNote] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await notesApi.getNote(noteId!);
        setNote(data);
      } catch (e: any) {
        setError(e.response?.data?.error || 'Failed to load note');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [noteId]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!note) return null;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="mb-6">
        <div className="text-sm text-gray-500">
          <Link to={`/class/${note.cls?.id || ''}`} className="hover:underline">{note.cls?.name || 'Class'}</Link>
          {' · '}
          {note.author ? (
            <Link to={`/user/${note.author.id}`} className="hover:underline">
              {note.author.first_name} {note.author.last_name}
            </Link>
          ) : (
            'Author'
          )}
          {' · '}
          {formatDate(note.created_at)}
        </div>
        {note.title && (
          <div className="mt-1 text-2xl font-bold text-gray-900 break-words">{note.title}</div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="text-lg font-semibold mb-3">Original PDF</h3>
          {note.pdf_url ? (
            <iframe title="pdf" src={note.pdf_url} className="w-full h-[70vh] rounded-md border" />
          ) : (
            <div className="text-gray-500 text-sm">No PDF available.</div>
          )}
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="text-lg font-semibold mb-3">Summary</h3>
          <div className="prose max-w-none">
            <ReactMarkdown>{note.content || ''}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteViewPage;
