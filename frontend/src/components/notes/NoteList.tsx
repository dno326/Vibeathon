import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface Author {
  id: string;
  first_name?: string;
  last_name?: string;
}

interface Cls {
  id: string;
  name: string;
}

interface NoteItem {
  id: string;
  content: string;
  created_at: string;
  public?: boolean;
  author?: Author | null;
  cls?: Cls | null;
}

interface NoteListProps {
  notes: NoteItem[];
  emptyText?: string;
  currentUserId?: string;
  onDelete?: (noteId: string) => void;
}

const NoteList: React.FC<NoteListProps> = ({ notes, emptyText, currentUserId, onDelete }) => {
  const navigate = useNavigate();
  if (!notes || notes.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        {emptyText || 'No notes to display'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notes.map((n) => {
        const isMine = currentUserId && n.author?.id === currentUserId;
        const displayName = n.author ? `${n.author.first_name || ''} ${n.author.last_name || ''}`.trim() : 'Unknown';
        const linkTo = isMine ? '/profile' : (n.author ? `/user/${n.author.id}` : '#');
        const className = n.cls?.name || 'Class';
        const classLink = n.cls ? `/class/${n.cls.id}` : '#';
        const preview = n.content.length > 240 ? n.content.slice(0, 240) + '…' : n.content;
        return (
          <div key={n.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="text-sm text-gray-500 mb-2 flex items-center gap-2 flex-wrap">
              {n.cls ? (
                <Link to={classLink} className="text-gray-700 hover:text-purple-700 font-medium">{className}</Link>
              ) : (
                <span className="text-gray-700">Class</span>
              )}
              <span>·</span>
              {n.author ? (
                <Link to={linkTo} className="text-purple-600 hover:text-purple-700 font-medium">
                  {displayName || 'User'}
                </Link>
              ) : (
                <span>User</span>
              )}
              <span>·</span>
              <span>{new Date(n.created_at).toLocaleString()}</span>
              {n.public === false ? <span className="ml-2 text-xs text-gray-400">(Private)</span> : null}
            </div>
            <div className="text-gray-800 text-sm whitespace-pre-wrap">
              <Link to={`/note/${n.id}`} className="hover:underline">
                {preview}
              </Link>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <Link to={`/note/${n.id}`} className="px-3 py-1 text-purple-600 hover:text-purple-700 text-sm font-medium">View</Link>
              {isMine && onDelete && (
                <button onClick={() => onDelete(n.id)} className="px-3 py-1 text-red-600 hover:text-red-700 text-sm font-medium">Delete</button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NoteList;
