import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import apiClient from '../../lib/apiClient';
import { notesApi } from '../../lib/notesApi';
import NoteList from '../../components/notes/NoteList';

function getInitials(first?: string, last?: string) {
  const f = (first || '').trim();
  const l = (last || '').trim();
  const fi = f ? f[0].toUpperCase() : '';
  const li = l ? l[0].toUpperCase() : '';
  return (fi + li) || 'U';
}

const ProfileViewPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
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
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        ) : !user ? (
          <div className="text-center py-12 text-gray-600">User not found</div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="flex items-center gap-4 mb-4">
              {user.profile_picture_url ? (
                <img
                  src={user.profile_picture_url}
                  alt="Profile"
                  className="h-16 w-16 rounded-full object-cover border"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-600 to-violet-600 text-white flex items-center justify-center text-xl font-bold">
                  {getInitials(user.first_name, user.last_name)}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-800 leading-tight">{user.first_name} {user.last_name}</h1>
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
              <h2 className="text-xl font-bold text-gray-800 mb-3">Public Notes</h2>
              {publicNotes.length === 0 ? (
                <div className="text-sm text-gray-500">No public notes to show.</div>
              ) : (
                <NoteList notes={publicNotes as any} emptyText="No public notes" backTo={`/user/${userId}`} />
              )}
            </div>

            {/* Public Flashcard Decks */}
            <div className="mt-8">
              <h2 className="text-xl font-bold text-gray-800 mb-3">Public Flashcard Decks</h2>
              {decks.length === 0 ? (
                <div className="text-sm text-gray-500">No public decks to show.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {decks.map((d) => (
                    <div key={d.id} className="p-4 bg-white rounded-xl border shadow-sm">
                      <div className="text-base font-semibold text-gray-900">{d.title}</div>
                      <div className="text-sm text-gray-500 mt-1">{d.cls?.name || 'Class'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileViewPage;
