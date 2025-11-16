import React, { useEffect, useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import PageContainer from '../../components/layout/PageContainer';
import { studyApi } from '../../lib/studyApi';
import { Link } from 'react-router-dom';

const StudyGroupsPage: React.FC = () => {
  const [groups, setGroups] = useState<Array<{ class: { id: string; name: string }, students: Array<{ id: string; first_name: string; last_name: string }> }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await studyApi.listGroups();
        setGroups(res.groups || []);
      } catch (e: any) {
        setError(e?.response?.data?.error || 'Failed to load study groups');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <PageContainer>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Study Groups</h1>
          <p className="text-gray-600 mt-2">Students in your classes who are currently looking for a study group.</p>
        </div>

        {loading ? (
          <div className="text-gray-600">Loading…</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : groups.length === 0 ? (
          <div className="text-gray-600">No students are currently looking for groups in your classes.</div>
        ) : (
          <div className="space-y-6">
            {groups.map(g => (
              <div key={g.class.id} className="bg-white rounded-2xl shadow-card border border-white/60 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">{g.class.name}</h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {g.students.map(s => (
                    <li key={s.id} className="px-4 py-3 rounded-xl border border-gray-200 bg-white flex items-center justify-between">
                      <Link to={`/user/${s.id}`} className="font-medium text-gray-900 hover:underline">
                        {s.first_name} {s.last_name}
                      </Link>
                      <span className="text-xs px-2 py-1 rounded-full bg-primary-50 text-primary-700 border border-primary-200">Looking</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </PageContainer>
    </div>
  );
};

export default StudyGroupsPage;


