import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import apiClient from '../../lib/apiClient';

const ProfileViewPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/api/auth/user/${userId}`);
        setUser(res.data);
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
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{user.first_name} {user.last_name}</h1>
            <p className="text-gray-600 mb-6">{user.email}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileViewPage;
