import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/formatDate';
import { Note } from '../../types/sessions';
import { notesApi } from '../../lib/notesApi';

interface NoteListProps {
  notes: Note[];
  currentUserId?: string;
  onDelete?: (id: string) => void;
  emptyText?: string;
  backTo?: string;
}

const MountainIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M3 20h18l-6-9-3 4-2-3-7 8z" />
  </svg>
);

const NoteList: React.FC<NoteListProps> = ({ notes, currentUserId, onDelete, emptyText, backTo }) => {
  const navigate = useNavigate();
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const entries = await Promise.all(
          notes.map(async (n) => {
            try {
              const v = await notesApi.getVotes(n.id);
              return [n.id, v.count] as const;
            } catch {
              return [n.id, 0] as const;
            }
          })
        );
        if (!cancelled) {
          const obj: Record<string, number> = {};
          for (const [id, cnt] of entries) obj[id] = cnt;
          setVoteCounts(obj);
        }
      } catch {}
    };
    if (notes && notes.length > 0) load();
    return () => { cancelled = true; };
  }, [notes]);

  if (!notes || notes.length === 0) {
    return <div className="text-gray-500">{emptyText || 'No notes yet.'}</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {notes.map((note) => (
        <div
          key={note.id}
          className="bg-white rounded-xl shadow hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
          role="button"
          onClick={() => navigate(`/note/${note.id}`, { state: backTo ? { backTo } : undefined })}
        >
          <div className="relative">
            {note.pdf_url && (
              <div className="w-full h-48 bg-gray-100 overflow-hidden">
                <iframe
                  title={`preview-${note.id}`}
                  src={`${note.pdf_url}#page=1&zoom=page-fit`}
                  className="w-full h-full pointer-events-none"
                />
              </div>
            )}
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-purple-700 inline-flex items-center gap-1 text-xs font-semibold shadow">
              <MountainIcon className="h-4 w-4" />
              <span>{voteCounts[note.id] ?? 0}</span>
            </div>
          </div>
          <div className="p-4">
            <div className="min-w-0">
              <Link
                to={`/class/${note.cls?.id || ''}`}
                className="text-base font-semibold text-gray-900 hover:underline break-words"
                onClick={(e) => e.stopPropagation()}
              >
                {note.cls?.name || 'Class'}
              </Link>
              <div className="text-sm text-gray-500 mt-0.5">
                {note.author ? (
                  <>
                    <Link
                      to={`/user/${note.author.id}`}
                      className="hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {note.author.first_name} {note.author.last_name}
                    </Link>
                    {' · '} {formatDate(note.created_at)}
                  </>
                ) : (
                  formatDate(note.created_at)
                )}
                {note.public === false && (
                  <span className="ml-2 inline-block text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 align-middle">Private</span>
                )}
              </div>
              {note.title && (
                <div className="mt-1 text-sm text-gray-800 font-medium break-words">{note.title}</div>
              )}
            </div>
            {currentUserId && note.created_by === currentUserId && onDelete && (
              <div className="mt-2 flex justify-end">
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
                  className="text-red-600 hover:text-red-700 text-sm font-semibold"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NoteList;
