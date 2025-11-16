import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/formatDate';
import { Note } from '../../types/sessions';

interface NoteListProps {
  notes: Note[];
  currentUserId?: string;
  onDelete?: (id: string) => void;
  emptyText?: string;
}

const NoteList: React.FC<NoteListProps> = ({ notes, currentUserId, onDelete, emptyText }) => {
  const navigate = useNavigate();

  if (!notes || notes.length === 0) {
    return <div className="text-gray-500">{emptyText || 'No notes yet.'}</div>;
  }

  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <div
          key={note.id}
          className="bg-white rounded-xl shadow p-4 cursor-pointer hover:shadow-md transition-shadow"
          role="button"
          onClick={() => navigate(`/note/${note.id}`)}
        >
          <div className="flex justify-between items-start gap-4">
            <div className="min-w-0">
              <Link
                to={`/class/${note.cls?.id || ''}`}
                className="text-lg font-semibold text-gray-900 hover:underline break-words"
                onClick={(e) => e.stopPropagation()}
              >
                {note.cls?.name || 'Class'}
              </Link>
              <div className="text-sm text-gray-500">
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
                <div className="mt-1 text-base text-gray-800 font-medium break-words">{note.title}</div>
              )}
            </div>
            {currentUserId && note.created_by === currentUserId && onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
                className="text-red-600 hover:text-red-700 text-sm font-semibold"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NoteList;
