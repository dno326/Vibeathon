import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { classApi } from '../../lib/classApi';
import { Class } from '../../types/classes';
import { formatDate } from '../../utils/formatDate';
import { notesApi } from '../../lib/notesApi';
import NoteList from '../../components/notes/NoteList';
import { useAuth } from '../../hooks/useAuth';
import { flashcardsApi } from '../../lib/flashcardsApi';
import { useNavigate as useNav } from 'react-router-dom';

const MountainIcon: React.FC<{ className?: string }>=({ className })=> (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M3 20h18l-6-9-3 4-2-3-7 8z" />
  </svg>
);

const ClassPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [classData, setClassData] = useState<(Class & { user_role?: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [classNotes, setClassNotes] = useState<Array<{ id: string; content: string; created_at: string; author?: any }>>([]);
  const [classDecks, setClassDecks] = useState<Array<any>>([]);
  const [deckVoteCounts, setDeckVoteCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (classId) {
      loadClass();
      loadNotes();
      loadDecks();
    }
  }, [classId]);

  const loadClass = async () => {
    if (!classId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await classApi.getClass(classId);
      setClassData(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load class');
    } finally {
      setLoading(false);
    }
  };

  const loadNotes = async () => {
    if (!classId) return;
    try {
      const notes = await notesApi.getClassNotes(classId);
      setClassNotes(notes);
    } catch (e) {
      // ignore
    }
  };

  const loadDecks = async () => {
    if (!classId) return;
    try {
      const decks = await flashcardsApi.listClassDecks(classId);
      setClassDecks(decks);
    } catch {}
  };

  useEffect(()=>{
    let cancelled = false;
    const loadCounts = async ()=>{
      try{
        const entries = await Promise.all((classDecks||[]).map(async (d)=>{
          try { const v = await flashcardsApi.getVotes(d.id); return [d.id, v.count] as const; } catch { return [d.id, 0] as const; }
        }));
        if(!cancelled){ const obj: Record<string, number> = {}; entries.forEach(([id,c])=>obj[id]=c); setDeckVoteCounts(obj); }
      } catch {}
    };
    if(classDecks.length>0) loadCounts();
    return ()=>{ cancelled = true; };
  },[classDecks]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading class...</p>
        </div>
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Class not found'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                {classData.name}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={async () => {
                  if (!classId) return;
                  try {
                    await classApi.leaveClass(classId);
                    navigate('/classes');
                  } catch (e) {
                    // silently ignore for now
                  }
                }}
                className="px-3 py-2 text-sm font-semibold text-red-700 border border-red-200 rounded-lg hover:bg-red-50"
              >
                Leave Class
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Class info card */}
        <div className="bg-white rounded-2xl shadow-card p-6 mb-8 border border-white/60">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Class Name</p>
              <p className="text-lg font-semibold text-gray-800">{classData.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Created</p>
              <p className="text-lg font-semibold text-gray-800">{formatDate(classData.created_at)}</p>
            </div>
          </div>
        </div>

        {/* Notes and Decks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notes section */}
          <div className="bg-white rounded-2xl shadow-card p-6 border border-white/60">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Notes</h2>
            <NoteList notes={classNotes as any} emptyText="No public notes yet" currentUserId={user?.id} />
          </div>

          {/* Decks section */}
          <div className="bg-white rounded-2xl shadow-card p-6 border border-white/60">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Flashcard Decks</h2>
            {classDecks.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p>No decks yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {classDecks.map((d) => (
                  <div
                    key={d.id}
                    className="p-4 bg-white rounded-2xl border border-white/60 shadow-card hover:shadow-float hover:border-primary-300 cursor-pointer transition-all duration-250 ease-out-soft"
                    onClick={()=>navigate(`/deck/${d.id}`)}
                  >
                    <div className="text-base font-semibold text-gray-900">{d.title}</div>
                    <div className="text-sm text-gray-500 mt-1">{d.cls?.name || 'Class'}</div>
                    {d.author && (
                      <div className="text-sm text-gray-600 mt-1" onClick={(e)=>{ e.stopPropagation(); navigate(`/user/${d.author.id}`); }}>
                        Added by {d.author.first_name} {d.author.last_name}
                      </div>
                    )}
                    <div className="mt-2 inline-flex items-center gap-1 text-primary-700 text-sm">
                      <MountainIcon className="h-4 w-4" /> {deckVoteCounts[d.id] ?? 0}
                    </div>
                    {user?.id && d.created_by === user.id && (
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={async (e)=>{ e.stopPropagation(); try{ await flashcardsApi.deleteDeck(d.id); loadDecks(); } catch{} }}
                          className="text-red-600 hover:text-red-700 text-sm font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassPage;
