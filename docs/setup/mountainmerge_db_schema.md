# MountainMerge Database Schema (Supabase / Postgres)

This document defines the logical database schema for MountainMerge.  
Types assume PostgreSQL syntax.

---

## 1. `users`

Stores core user profiles. Authentication is handled by Supabase auth; this table extends profile info.

```sql
CREATE TABLE users (
  id          uuid PRIMARY KEY,        -- matches Supabase auth user id
  email       text UNIQUE NOT NULL,
  name        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);
```

**Indexes**
```sql
CREATE INDEX idx_users_email ON users(email);
```

---

## 2. `classes`

Represents a course or class workspace.

```sql
CREATE TABLE classes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  code        text UNIQUE,            -- join code
  owner_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now()
);
```

**Indexes**
```sql
CREATE INDEX idx_classes_owner_id ON classes(owner_id);
CREATE UNIQUE INDEX idx_classes_code_unique ON classes(code);
```

---

## 3. `class_members`

Many-to-many relationship between users and classes.

```sql
CREATE TABLE class_members (
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  class_id    uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  role        text NOT NULL DEFAULT 'member',  -- member | owner | ta
  joined_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, class_id)
);
```

**Indexes**
```sql
CREATE INDEX idx_class_members_class_id ON class_members(class_id);
CREATE INDEX idx_class_members_user_id ON class_members(user_id);
```

---

## 4. `sessions`

Represents a single lecture or study session (e.g., “Week 3 – Recurrence Relations”).

```sql
CREATE TABLE sessions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id    uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  title       text NOT NULL,
  created_by  uuid REFERENCES users(id),
  created_at  timestamptz NOT NULL DEFAULT now()
);
```

**Indexes**
```sql
CREATE INDEX idx_sessions_class_id ON sessions(class_id);
CREATE INDEX idx_sessions_created_at ON sessions(created_at);
```

---

## 5. `notes`

Stores AI-generated and user-edited notes for a session.

```sql
CREATE TYPE note_type AS ENUM ('audio', 'slides', 'merged', 'manual');

CREATE TABLE notes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  type        note_type NOT NULL,
  content     text NOT NULL,
  created_by  uuid REFERENCES users(id),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
```

**Indexes**
```sql
CREATE INDEX idx_notes_session_id ON notes(session_id);
CREATE INDEX idx_notes_type ON notes(type);
```

---

## 6. `flashcard_decks`

A deck of flashcards, tied to a class and optionally to a specific session.

```sql
CREATE TABLE flashcard_decks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id    uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  session_id  uuid REFERENCES sessions(id) ON DELETE SET NULL,
  title       text NOT NULL,
  public      boolean NOT NULL DEFAULT true,   -- visible to all class members
  created_by  uuid NOT NULL REFERENCES users(id),
  created_at  timestamptz NOT NULL DEFAULT now()
);
```

**Indexes**
```sql
CREATE INDEX idx_flashcard_decks_class_id ON flashcard_decks(class_id);
CREATE INDEX idx_flashcard_decks_session_id ON flashcard_decks(session_id);
```

---

## 7. `flashcards`

Individual Q&A cards inside a deck.

```sql
CREATE TABLE flashcards (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id     uuid NOT NULL REFERENCES flashcard_decks(id) ON DELETE CASCADE,
  question    text NOT NULL,
  answer      text NOT NULL,
  topic       text,                        -- optional tag (e.g., "definition")
  created_by  uuid REFERENCES users(id),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
```

**Indexes**
```sql
CREATE INDEX idx_flashcards_deck_id ON flashcards(deck_id);
CREATE INDEX idx_flashcards_topic ON flashcards(topic);
```

---

## 8. `comments`

Comments on sessions/notes to support collaboration and Q&A.

```sql
CREATE TABLE comments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  note_id     uuid REFERENCES notes(id) ON DELETE SET NULL,
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text        text NOT NULL,
  anchor      text,                        -- optional: reference (e.g. line number)
  created_at  timestamptz NOT NULL DEFAULT now()
);
```

**Indexes**
```sql
CREATE INDEX idx_comments_session_id ON comments(session_id);
CREATE INDEX idx_comments_note_id ON comments(note_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
```

---

## 9. `upvotes`

Reactions/upvotes on notes and decks.

```sql
CREATE TYPE upvote_target_type AS ENUM ('note', 'deck');

CREATE TABLE upvotes (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_id    uuid NOT NULL,
  target_type  upvote_target_type NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, target_id, target_type)
);
```

**Indexes**
```sql
CREATE INDEX idx_upvotes_user_id ON upvotes(user_id);
CREATE INDEX idx_upvotes_target ON upvotes(target_id, target_type);
```

---

## 10. `study_events` (Optional / Stretch)

Stores flashcard review events for spaced repetition and analytics.

```sql
CREATE TYPE study_result AS ENUM ('again', 'hard', 'good', 'easy');

CREATE TABLE study_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  deck_id     uuid NOT NULL REFERENCES flashcard_decks(id) ON DELETE CASCADE,
  card_id     uuid NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  result      study_result NOT NULL,
  elapsed_ms  integer,
  created_at  timestamptz NOT NULL DEFAULT now()
);
```

**Indexes**
```sql
CREATE INDEX idx_study_events_user_id ON study_events(user_id);
CREATE INDEX idx_study_events_deck_id ON study_events(deck_id);
CREATE INDEX idx_study_events_card_id ON study_events(card_id);
```

---

## 11. Relationships Summary

- `users` ↔ `classes` via `class_members` (many-to-many).
- `classes` ↔ `sessions` (one-to-many).
- `sessions` ↔ `notes` (one-to-many).
- `classes` ↔ `flashcard_decks` (one-to-many).
- `flashcard_decks` ↔ `flashcards` (one-to-many).
- `sessions` ↔ `comments` (one-to-many).
- `notes` ↔ `comments` (optional, one-to-many).
- `notes` & `flashcard_decks` ↔ `upvotes` (polymorphic one-to-many).
- `flashcards` ↔ `study_events` & `users` (many-to-many via `study_events`).

This schema is designed to:
- Support collaborative notes per class and session.
- Support AI-generated notes tied to the same core structures.
- Support flashcards with usage analytics and spaced repetition.
- Remain flexible enough for future features like study rooms and analytics dashboards.
