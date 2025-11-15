-- MountainMerge Database Setup Script
-- Run this script in your Supabase SQL Editor to create all tables, types, and indexes

-- ============================================
-- 1. Create Custom Types
-- ============================================

CREATE TYPE note_type AS ENUM ('audio', 'slides', 'merged', 'manual');
CREATE TYPE upvote_target_type AS ENUM ('note', 'deck');
CREATE TYPE study_result AS ENUM ('again', 'hard', 'good', 'easy');

-- ============================================
-- 2. Create Tables
-- ============================================

-- Users table (extends Supabase auth.users)
-- Note: This table will be populated automatically via trigger when users sign up
CREATE TABLE IF NOT EXISTS users (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text UNIQUE NOT NULL,
  first_name  text NOT NULL,
  last_name   text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Classes table
CREATE TABLE IF NOT EXISTS classes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  code        text UNIQUE,            -- join code
  owner_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Class members (many-to-many relationship)
CREATE TABLE IF NOT EXISTS class_members (
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  class_id    uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  role        text NOT NULL DEFAULT 'member',  -- member | owner | ta
  joined_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, class_id)
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id    uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  title       text NOT NULL,
  created_by  uuid REFERENCES users(id),
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  type        note_type NOT NULL,
  content     text NOT NULL,
  created_by  uuid REFERENCES users(id),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Flashcard decks table
CREATE TABLE IF NOT EXISTS flashcard_decks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id    uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  session_id  uuid REFERENCES sessions(id) ON DELETE SET NULL,
  title       text NOT NULL,
  public      boolean NOT NULL DEFAULT true,   -- visible to all class members
  created_by  uuid NOT NULL REFERENCES users(id),
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Flashcards table
CREATE TABLE IF NOT EXISTS flashcards (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id     uuid NOT NULL REFERENCES flashcard_decks(id) ON DELETE CASCADE,
  question    text NOT NULL,
  answer      text NOT NULL,
  topic       text,                        -- optional tag (e.g., "definition")
  created_by  uuid REFERENCES users(id),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  note_id     uuid REFERENCES notes(id) ON DELETE SET NULL,
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text        text NOT NULL,
  anchor      text,                        -- optional: reference (e.g. line number)
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Upvotes table
CREATE TABLE IF NOT EXISTS upvotes (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_id    uuid NOT NULL,
  target_type  upvote_target_type NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, target_id, target_type)
);

-- Study events table (optional / stretch feature)
CREATE TABLE IF NOT EXISTS study_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  deck_id     uuid NOT NULL REFERENCES flashcard_decks(id) ON DELETE CASCADE,
  card_id     uuid NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  result      study_result NOT NULL,
  elapsed_ms  integer,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- 3. Create Indexes
-- ============================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Classes indexes
CREATE INDEX IF NOT EXISTS idx_classes_owner_id ON classes(owner_id);
-- Unique index for class codes (allows NULL codes)
CREATE UNIQUE INDEX IF NOT EXISTS idx_classes_code_unique ON classes(code) WHERE code IS NOT NULL;

-- Class members indexes
CREATE INDEX IF NOT EXISTS idx_class_members_class_id ON class_members(class_id);
CREATE INDEX IF NOT EXISTS idx_class_members_user_id ON class_members(user_id);

-- Sessions indexes
CREATE INDEX IF NOT EXISTS idx_sessions_class_id ON sessions(class_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at);

-- Notes indexes
CREATE INDEX IF NOT EXISTS idx_notes_session_id ON notes(session_id);
CREATE INDEX IF NOT EXISTS idx_notes_type ON notes(type);

-- Flashcard decks indexes
CREATE INDEX IF NOT EXISTS idx_flashcard_decks_class_id ON flashcard_decks(class_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_decks_session_id ON flashcard_decks(session_id);

-- Flashcards indexes
CREATE INDEX IF NOT EXISTS idx_flashcards_deck_id ON flashcards(deck_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_topic ON flashcards(topic);

-- Comments indexes
CREATE INDEX IF NOT EXISTS idx_comments_session_id ON comments(session_id);
CREATE INDEX IF NOT EXISTS idx_comments_note_id ON comments(note_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

-- Upvotes indexes
CREATE INDEX IF NOT EXISTS idx_upvotes_user_id ON upvotes(user_id);
CREATE INDEX IF NOT EXISTS idx_upvotes_target ON upvotes(target_id, target_type);

-- Study events indexes
CREATE INDEX IF NOT EXISTS idx_study_events_user_id ON study_events(user_id);
CREATE INDEX IF NOT EXISTS idx_study_events_deck_id ON study_events(deck_id);
CREATE INDEX IF NOT EXISTS idx_study_events_card_id ON study_events(card_id);

-- ============================================
-- 4. Enable Row Level Security (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. Create RLS Policies (Basic)
-- ============================================

-- Users: Users can read their own profile and update it
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Classes: Members can view classes they belong to
CREATE POLICY "Class members can view classes" ON classes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM class_members
      WHERE class_members.class_id = classes.id
      AND class_members.user_id = auth.uid()
    )
  );

-- Class members: Users can view members of their classes
CREATE POLICY "Users can view class members" ON class_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM class_members cm
      WHERE cm.class_id = class_members.class_id
      AND cm.user_id = auth.uid()
    )
  );

-- Sessions: Class members can view sessions in their classes
CREATE POLICY "Class members can view sessions" ON sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM class_members
      WHERE class_members.class_id = sessions.class_id
      AND class_members.user_id = auth.uid()
    )
  );

-- Notes: Class members can view notes in their class sessions
CREATE POLICY "Class members can view notes" ON notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sessions s
      JOIN class_members cm ON cm.class_id = s.class_id
      WHERE s.id = notes.session_id
      AND cm.user_id = auth.uid()
    )
  );

-- Flashcard decks: Class members can view public decks or their own decks
CREATE POLICY "Class members can view decks" ON flashcard_decks
  FOR SELECT USING (
    public = true OR created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM class_members
      WHERE class_members.class_id = flashcard_decks.class_id
      AND class_members.user_id = auth.uid()
    )
  );

-- Flashcards: Users can view flashcards in decks they can access
CREATE POLICY "Users can view flashcards" ON flashcards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM flashcard_decks fd
      WHERE fd.id = flashcards.deck_id
      AND (fd.public = true OR fd.created_by = auth.uid() OR
           EXISTS (
             SELECT 1 FROM class_members cm
             WHERE cm.class_id = fd.class_id
             AND cm.user_id = auth.uid()
           ))
    )
  );

-- Comments: Class members can view and create comments
CREATE POLICY "Class members can view comments" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sessions s
      JOIN class_members cm ON cm.class_id = s.class_id
      WHERE s.id = comments.session_id
      AND cm.user_id = auth.uid()
    )
  );

-- Upvotes: Users can view upvotes and manage their own
CREATE POLICY "Users can view upvotes" ON upvotes
  FOR SELECT USING (true);

-- Study events: Users can view and create their own study events
CREATE POLICY "Users can manage own study events" ON study_events
  FOR ALL USING (user_id = auth.uid());

-- ============================================
-- 6. Create Functions (Optional Helpers)
-- ============================================

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Setup Complete!
-- ============================================

