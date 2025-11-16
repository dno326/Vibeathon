import React from 'react';

interface NoteItem {
  id: string;
  content: string;
  created_at: string;
  public?: boolean;
}

interface NoteListProps {
  notes: NoteItem[];
  emptyText?: string;
}

const NoteList: React.FC<NoteListProps> = ({ notes, emptyText }) => {
  if (!notes || notes.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        {emptyText || 'No notes to display'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notes.map((n) => (
        <div key={n.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="text-sm text-gray-500 mb-2">{new Date(n.created_at).toLocaleString()} {n.public === false ? '· Private' : ''}</div>
          <pre className="whitespace-pre-wrap text-gray-800 text-sm">{n.content}</pre>
        </div>
      ))}
    </div>
  );
};

export default NoteList;
