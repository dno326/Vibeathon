export type NoteType = 'audio' | 'slides' | 'merged' | 'manual';

export interface Session {
  id: string;
  class_id: string;
  title: string;
  created_by: string;
  created_at: string;
}

export interface NoteAuthor {
  id: string;
  first_name: string;
  last_name: string;
}

export interface NoteClassRef {
  id: string;
  name: string;
}

export interface Note {
  id: string;
  session_id: string;
  type: string;
  title?: string;
  content: string;
  public: boolean;
  created_at: string;
  created_by: string;
  pdf_url?: string;
  author?: NoteAuthor;
  cls?: NoteClassRef;
}

