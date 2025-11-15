import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { classApi } from '../../lib/classApi';
import { Class } from '../../types/classes';
import { formatDate } from '../../utils/formatDate';

const ClassPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [classData, setClassData] = useState<(Class & { user_role?: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (classId) {
      loadClass();
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
            <div className="flex items-center gap-4">
              {classData.user_role === 'owner' && (
                <span className="px-3 py-1 text-sm font-semibold bg-purple-100 text-purple-700 rounded-lg">
                  Owner
                </span>
              )}
              <span className="text-sm text-gray-600">
                Code: <span className="font-mono font-semibold text-purple-600">{classData.code}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Class info card */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Class Name</p>
              <p className="text-lg font-semibold text-gray-800">{classData.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Class Code</p>
              <p className="text-lg font-mono font-semibold text-purple-600">{classData.code}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Created</p>
              <p className="text-lg font-semibold text-gray-800">{formatDate(classData.created_at)}</p>
            </div>
          </div>
        </div>

        {/* Placeholder for future content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sessions section */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Sessions</h2>
            <div className="text-center py-12 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No sessions yet</p>
              <p className="text-sm mt-2">Sessions will appear here when you upload audio or slides</p>
            </div>
          </div>

          {/* Decks section */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Flashcard Decks</h2>
            <div className="text-center py-12 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p>No decks yet</p>
              <p className="text-sm mt-2">Flashcard decks will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassPage;
