export type NoteType = 'audio' | 'slides' | 'merged' | 'manual';

export interface Session {
  id: string;
  class_id: string;
  title: string;
  created_by: string;
  created_at: string;
}

export interface Note {
  id: string;
  session_id: string;
  type: NoteType;
  content: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

