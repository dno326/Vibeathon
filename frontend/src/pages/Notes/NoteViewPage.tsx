import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { notesApi } from '../../lib/notesApi';

const NoteViewPage: React.FC = () => {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await notesApi.getNote(noteId!);
        setNote(data);
      } catch (e) {
        setNote(null);
      } finally {
        setLoading(false);
      }
    };
    if (noteId) load();
  }, [noteId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading note...</p>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Not found</h2>
          <button onClick={() => navigate(-1)} className="px-6 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all">Go Back</button>
        </div>
      </div>
    );
  }

  const author = note.author ? `${note.author.first_name || ''} ${note.author.last_name || ''}`.trim() : 'User';

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 mb-6">
          <div className="text-sm text-gray-600 flex flex-wrap items-center gap-2">
            {note.cls ? (
              <Link to={`/class/${note.cls.id}`} className="text-gray-700 hover:text-purple-700 font-medium">{note.cls.name}</Link>
            ) : <span>Class</span>}
            <span>·</span>
            {note.author ? (
              <Link to={`/user/${note.author.id}`} className="text-purple-600 hover:text-purple-700 font-medium">{author}</Link>
            ) : <span>{author}</span>}
            <span>·</span>
            <span>{new Date(note.created_at).toLocaleString()}</span>
          </div>
        </div>

        {note.pdf_url && (
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Original PDF</h3>
            <div className="aspect-[4/3] w-full bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
              <iframe src={note.pdf_url} title="PDF" className="w-full h-full" />
            </div>
            <div className="mt-3">
              <a href={note.pdf_url} target="_blank" rel="noreferrer" className="text-purple-600 hover:text-purple-700 font-medium">Open in new tab</a>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Summary</h3>
          <pre className="whitespace-pre-wrap text-gray-800 text-sm">{note.content}</pre>
        </div>
      </div>
    </div>
  );
};

export default NoteViewPage;
