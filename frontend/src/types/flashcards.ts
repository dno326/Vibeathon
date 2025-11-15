export interface FlashcardDeck {
  id: string;
  class_id: string;
  session_id: string | null;
  title: string;
  public: boolean;
  created_by: string;
  created_at: string;
}

export interface Flashcard {
  id: string;
  deck_id: string;
  question: string;
  answer: string;
  topic: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

