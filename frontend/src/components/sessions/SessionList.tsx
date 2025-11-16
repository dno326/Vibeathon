import React from 'react';
import SessionCard from './SessionCard';

interface Session {
  id: string;
  title: string;
  date?: string;
  duration?: string;
}

interface SessionListProps {
  sessions?: Session[];
  onOpen?: (sessionId: string) => void;
}

const SessionList: React.FC<SessionListProps> = ({ sessions = [], onOpen }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {sessions.map((s) => (
        <SessionCard key={s.id} title={s.title} date={s.date} duration={s.duration} onClick={() => onOpen?.(s.id)} />
      ))}
    </div>
  );
};

export default SessionList;

