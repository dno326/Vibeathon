import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import apiClient from '../../lib/apiClient';
import { notesApi } from '../../lib/notesApi';
import NoteList from '../../components/notes/NoteList';
import PageContainer from '../../components/layout/PageContainer';
import Spinner from '../../components/common/Spinner';

function getInitials(first?: string, last?: string) {
  const f = (first || '').trim();
  const l = (last || '').trim();
  const fi = f ? f[0].toUpperCase() : '';
  const li = l ? l[0].toUpperCase() : '';
  return (fi + li) || 'U';
}

const ProfileViewPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [publicNotes, setPublicNotes] = useState<any[]>([]);
  const [decks, setDecks] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/api/auth/user/${userId}`);
        setUser(res.data);
        const notes = await notesApi.getUserPublicNotes(userId!);
        setPublicNotes(notes);
        try {
          const dres = await apiClient.get(`/api/decks/user/${userId}`);
          setDecks(dres.data.decks || []);
        } catch {}
      } catch (e) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    if (userId) load();
  }, [userId]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <PageContainer>
        {loading ? (
          <div className="flex items-center justify-center py-16"><Spinner /><p className="ml-3 text-gray-600">Loading profile...</p></div>
        ) : !user ? (
          <div className="text-center py-12 text-gray-600">User not found</div>
        ) : (
          <div className="bg-white rounded-2xl shadow-card border border-white/60 p-8">
            <button onClick={()=>navigate(-1)} className="mb-4 p-2 hover:bg-gray-100 rounded-lg" aria-label="Go back">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center gap-4 mb-4">
              {user.profile_picture_url ? (
                <img
                  src={user.profile_picture_url}
                  alt="Profile"
                  className="h-16 w-16 rounded-full object-cover border"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary-600 to-violet-600 text-white flex items-center justify-center text-xl font-bold">
                  {getInitials(user.first_name, user.last_name)}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 leading-tight">{user.first_name} {user.last_name}</h1>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {user.grade && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Grade / Year</p>
                  <p className="text-gray-800 font-semibold">{user.grade}</p>
                </div>
              )}
              {user.major && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Major</p>
                  <p className="text-gray-800 font-semibold">{user.major}</p>
                </div>
              )}
            </div>

            {/* Public Notes */}
            <div className="mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Public Notes</h2>
              {publicNotes.length === 0 ? (
                <div className="text-sm text-gray-500">No public notes to show.</div>
              ) : (
                <NoteList notes={publicNotes as any} emptyText="No public notes" backTo={`/user/${userId}`} />
              )}
            </div>

            {/* Public Flashcard Decks */}
            <div className="mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Public Flashcard Decks</h2>
              {decks.length === 0 ? (
                <div className="text-sm text-gray-500">No public decks to show.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {decks.map((d) => (
                    <div key={d.id} className="p-4 bg-white rounded-2xl border border-white/60 shadow-card">
                      <div className="text-base font-semibold text-gray-900">{d.title}</div>
                      <div className="text-sm text-gray-500 mt-1">{d.cls?.name || 'Class'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
};

export default ProfileViewPage;
