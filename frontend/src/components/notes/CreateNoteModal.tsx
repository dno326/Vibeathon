import React, { useEffect, useState } from 'react';
import { classApi } from '../../lib/classApi';
import { notesApi } from '../../lib/notesApi';
import { Class } from '../../types/classes';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';

interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateNoteModal: React.FC<CreateNoteModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [allClasses, setAllClasses] = useState<Class[]>([]);
  const [classId, setClassId] = useState('');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      try {
        const list = await classApi.getAllClasses();
        setAllClasses(list);
      } catch (e: any) {
        setError(e.response?.data?.error || 'Failed to load classes');
      }
    };
    load();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError('Please select a PDF'); return; }
    if (!classId) { setError('Please select a class'); return; }

    try {
      setLoading(true);
      setError(null);
      await notesApi.uploadPdf(file, classId, isPublic, title.trim() || undefined);
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e.response?.data?.error || e.message || 'Failed to create note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Note from PDF">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title (optional)</label>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
            placeholder="e.g., Vietnam War Overview"
            maxLength={180}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">PDF File</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            disabled={loading}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Class</label>
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            disabled={loading}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 shadow-soft focus:border-primary-400 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
          >
            <option value="">Select a class...</option>
            {allClasses.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <input
            id="public"
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            disabled={loading}
          />
          <label htmlFor="public" className="text-sm text-gray-700">Public (visible to class)</label>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            onClick={onClose}
            disabled={loading}
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || !file || !classId}
          >
            {loading ? 'Creating...' : 'Create Note'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateNoteModal;
