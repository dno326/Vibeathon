import React, { useEffect, useMemo, useState } from 'react';
import { classApi } from '../../lib/classApi';
import { Class } from '../../types/classes';

interface JoinClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const JoinClassModal: React.FC<JoinClassModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [allClasses, setAllClasses] = useState<Class[]>([]);
  const [search, setSearch] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [newClassName, setNewClassName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      try {
        setLoading(true);
        const list = await classApi.getAllClasses();
        setAllClasses(list);
      } catch (e: any) {
        setError(e.response?.data?.error || 'Failed to load classes');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOpen]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allClasses;
    return allClasses.filter(c => c.name.toLowerCase().includes(q));
  }, [allClasses, search]);

  if (!isOpen) return null;

  const handleJoin = async () => {
    if (!selectedClassId) return;
    try {
    setLoading(true);
    setError(null);
      await classApi.joinClassById(selectedClassId);
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to join class');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAndJoin = async () => {
    if (!newClassName.trim()) return;
    try {
      setLoading(true);
      setError(null);
      const created = await classApi.createClass(newClassName.trim());
      await classApi.joinClassById(created.id);
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to create class');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Find your class</h2>
        <p className="text-gray-600 mb-4">Search and select a class to join. If you don't see it, add a new one.</p>
        
          <div className="mb-4">
            <input
              type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search classes by name"
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              disabled={loading}
          />
        </div>

        <div className="max-h-64 overflow-y-auto border border-gray-100 rounded-xl">
          {loading ? (
            <div className="p-6 text-center text-gray-600">Loading classes...</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center text-gray-600">No classes found.</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filtered.map((cls) => (
                <li key={cls.id} className="p-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-800">{cls.name}</div>
                    <div className="text-xs text-gray-500">{new Date(cls.created_at).toLocaleString()}</div>
                  </div>
                  <input
                    type="radio"
                    name="classSelect"
                    checked={selectedClassId === cls.id}
                    onChange={() => setSelectedClassId(cls.id)}
                  />
                </li>
              ))}
            </ul>
          )}
          </div>

          {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              type="button"
            onClick={handleJoin}
            disabled={loading || !selectedClassId}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Joining...' : 'Join Selected'}
          </button>

          <div className="flex gap-2">
            <input
              type="text"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="Add new class name"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              disabled={loading}
            />
            <button
              type="button"
              onClick={handleCreateAndJoin}
              disabled={loading || !newClassName.trim()}
              className="px-4 py-2 border-2 border-purple-600 text-purple-600 font-semibold rounded-xl hover:bg-purple-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Add Class'}
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinClassModal;

