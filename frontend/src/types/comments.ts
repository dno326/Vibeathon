export interface Comment {
  id: string;
  session_id: string;
  note_id: string | null;
  user_id: string;
  text: string;
  anchor: string | null;
  created_at: string;
}

