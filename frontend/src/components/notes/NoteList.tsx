import React from 'react';
import { Link } from 'react-router-dom';

interface Author {
  id: string;
  first_name?: string;
  last_name?: string;
}

interface NoteItem {
  id: string;
  content: string;
  created_at: string;
  public?: boolean;
  author?: Author | null;
}

interface NoteListProps {
  notes: NoteItem[];
  emptyText?: string;
  currentUserId?: string;
}

const NoteList: React.FC<NoteListProps> = ({ notes, emptyText, currentUserId }) => {
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
        return (
          <div key={n.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="text-sm text-gray-500 mb-2 flex items-center gap-2">
              <span>{new Date(n.created_at).toLocaleString()}</span>
              <span>·</span>
              {n.author ? (
                <Link to={linkTo} className="text-purple-600 hover:text-purple-700 font-medium">
                  {displayName || 'User'}
                </Link>
              ) : (
                <span>User</span>
              )}
              {n.public === false ? <span className="ml-2 text-xs text-gray-400">(Private)</span> : null}
            </div>
            <pre className="whitespace-pre-wrap text-gray-800 text-sm">{n.content}</pre>
          </div>
        );
      })}
    </div>
  );
};

export default NoteList;
