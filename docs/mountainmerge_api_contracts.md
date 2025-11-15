# MountainMerge API Contracts

This document defines the REST API contracts for the MountainMerge backend (Flask).  
All responses are JSON. All times are ISO 8601 strings in UTC.

Base URL examples:
- Local: `http://localhost:5000/api`
- Production: `https://api.mountainmerge.app/api` (example)

Authentication:
- Most endpoints require a Bearer token: `Authorization: Bearer <JWT or Supabase token>`.

---

## 1. Auth Endpoints

### 1.1 `POST /api/auth/signup`

Register a new user.

**Auth:** Public

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "string",
  "name": "Justin Burrell"
}
```

**Response 201**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Justin Burrell",
    "created_at": "2025-11-15T10:00:00Z"
  },
  "access_token": "jwt-or-supabase-token"
}
```

**Error Responses**
- 400: invalid input
- 409: email already exists

---

### 1.2 `POST /api/auth/login`

Authenticate an existing user.

**Auth:** Public

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "string"
}
```

**Response 200**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Justin Burrell"
  },
  "access_token": "jwt-or-supabase-token"
}
```

**Error Responses**
- 400: invalid input
- 401: invalid credentials

---

### 1.3 `GET /api/auth/me`

Return the currently authenticated user.

**Auth:** Required

**Response 200**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "Justin Burrell",
  "created_at": "2025-11-15T10:00:00Z"
}
```

**Error Responses**
- 401: missing/invalid token

---

## 2. Classes

### 2.1 `POST /api/classes`

Create a new class.

**Auth:** Required

**Request Body**
```json
{
  "name": "CSE 241 - Data Structures",
  "code": "CSE241FA25"   // optional human-readable code
}
```

**Response 201**
```json
{
  "id": "uuid",
  "name": "CSE 241 - Data Structures",
  "code": "CSE241FA25",
  "owner_id": "uuid",
  "created_at": "2025-11-15T10:05:00Z"
}
```

---

### 2.2 `POST /api/classes/join`

Join an existing class by code or invite link token.

**Auth:** Required

**Request Body**
```json
{
  "code": "CSE241FA25"
}
```

**Response 200**
```json
{
  "class": {
    "id": "uuid",
    "name": "CSE 241 - Data Structures",
    "code": "CSE241FA25"
  }
}
```

**Error Responses**
- 404: class not found
- 409: already a member

---

### 2.3 `GET /api/classes`

List classes the user belongs to.

**Auth:** Required

**Response 200**
```json
{
  "classes": [
    {
      "id": "uuid",
      "name": "CSE 241 - Data Structures",
      "code": "CSE241FA25"
    },
    {
      "id": "uuid-2",
      "name": "MATH 205 - Linear Methods",
      "code": "MATH205"
    }
  ]
}
```

---

### 2.4 `GET /api/classes/{class_id}`

Get class details, sessions, and decks summary.

**Auth:** Required, must be member

**Response 200**
```json
{
  "id": "uuid",
  "name": "CSE 241 - Data Structures",
  "code": "CSE241FA25",
  "sessions": [
    {
      "id": "session-uuid",
      "title": "Week 3 - Recurrence Relations",
      "created_at": "2025-11-15T11:00:00Z"
    }
  ],
  "decks": [
    {
      "id": "deck-uuid",
      "title": "Midterm 1 Key Concepts",
      "public": true,
      "card_count": 42
    }
  ]
}
```

**Error Responses**
- 403: not a member
- 404: class not found

---

## 3. Sessions (Lectures)

### 3.1 `POST /api/sessions/audio`

Create a session from audio upload.

**Auth:** Required

**Request:** `multipart/form-data`
- `class_id` (string, required)
- `title` (string, optional)
- `audio` (file, required; .mp3, .wav, .m4a)

**Process**
1. Store audio (optional).
2. Transcribe with Whisper.
3. Generate AI notes.
4. Create `session` + `notes` entries.

**Response 202 (accepted/processing) or 201 (if synchronous)**
```json
{
  "session": {
    "id": "session-uuid",
    "class_id": "uuid",
    "title": "Week 3 - Recurrence Relations",
    "created_at": "2025-11-15T11:00:00Z"
  },
  "notes": {
    "id": "notes-uuid",
    "session_id": "session-uuid",
    "type": "audio",
    "content": "## Recurrence Relations\n- Definition...\n"
  }
}
```

**Error Responses**
- 400: missing file or class_id
- 403: user not in class

---

### 3.2 `POST /api/sessions/slides`

Create a session from slides/PDF.

**Auth:** Required

**Request:** `multipart/form-data`
- `class_id` (string, required)
- `title` (string, optional)
- `file` (file, required; .pdf, .pptx, images)

**Response 201**
```json
{
  "session": {
    "id": "session-uuid",
    "class_id": "uuid",
    "title": "Dynamic Programming Lecture",
    "created_at": "2025-11-15T12:00:00Z"
  },
  "notes": {
    "id": "notes-uuid",
    "session_id": "session-uuid",
    "type": "slides",
    "content": "## Slide 1: Intro\n...\n"
  }
}
```

---

### 3.3 `GET /api/sessions/{session_id}`

Fetch a session with its notes and flashcard deck summary.

**Auth:** Required, must be in class

**Response 200**
```json
{
  "id": "session-uuid",
  "class_id": "uuid",
  "title": "Week 3 - Recurrence Relations",
  "created_at": "2025-11-15T11:00:00Z",
  "notes": [
    {
      "id": "notes-audio",
      "type": "audio",
      "content": "## Audio-based notes..."
    },
    {
      "id": "notes-slides",
      "type": "slides",
      "content": "## Slide-based notes..."
    },
    {
      "id": "notes-merged",
      "type": "merged",
      "content": "## Master notes..."
    }
  ],
  "decks": [
    {
      "id": "deck-uuid",
      "title": "Recurrence Relations Flashcards",
      "card_count": 20
    }
  ]
}
```

---

### 3.4 `PATCH /api/sessions/{session_id}`

Update session metadata (e.g., title).

**Auth:** Required, must have edit privileges

**Request Body**
```json
{
  "title": "Week 3 - Recurrence Relations & DP Intro"
}
```

**Response 200**
```json
{
  "id": "session-uuid",
  "title": "Week 3 - Recurrence Relations & DP Intro"
}
```

---

## 4. Notes

### 4.1 `GET /api/notes/{note_id}`

Get a specific note record.

**Auth:** Required

**Response 200**
```json
{
  "id": "notes-uuid",
  "session_id": "session-uuid",
  "type": "merged",
  "content": "## Master Notes\n..."
}
```

---

### 4.2 `PUT /api/notes/{note_id}`

Replace the content of a note (for manual edits).

**Auth:** Required, must have edit rights

**Request Body**
```json
{
  "content": "## Updated Master Notes\n- Point 1...\n- Point 2...\n"
}
```

**Response 200**
```json
{
  "id": "notes-uuid",
  "session_id": "session-uuid",
  "type": "merged",
  "content": "## Updated Master Notes\n- Point 1...\n- Point 2...\n"
}
```

---

### 4.3 `POST /api/notes/{note_id}/merge`

Create or update a merged set of notes for a session (combining audio + slides).

**Auth:** Required

**Request Body**
```json
{
  "source_note_ids": [
    "notes-audio",
    "notes-slides"
  ]
}
```

**Response 200**
```json
{
  "id": "notes-merged",
  "session_id": "session-uuid",
  "type": "merged",
  "content": "## Unified Notes\n..."
}
```

---

## 5. Flashcards & Decks

### 5.1 `POST /api/decks`

Create a new deck (optionally from a note).

**Auth:** Required

**Request Body**
```json
{
  "class_id": "uuid",
  "session_id": "session-uuid",
  "title": "Recurrence Relations Flashcards",
  "public": true
}
```

**Response 201**
```json
{
  "id": "deck-uuid",
  "class_id": "uuid",
  "session_id": "session-uuid",
  "title": "Recurrence Relations Flashcards",
  "public": true
}
```

---

### 5.2 `POST /api/decks/{deck_id}/generate`

Generate flashcards from a note using AI.

**Auth:** Required

**Request Body**
```json
{
  "note_id": "notes-merged",
  "count": 20
}
```

**Response 201**
```json
{
  "deck_id": "deck-uuid",
  "created_cards": 20
}
```

---

### 5.3 `GET /api/decks/{deck_id}`

Fetch a deck and its cards.

**Auth:** Required, must have access rights

**Response 200**
```json
{
  "id": "deck-uuid",
  "class_id": "uuid",
  "title": "Recurrence Relations Flashcards",
  "public": true,
  "cards": [
    {
      "id": "card-uuid-1",
      "question": "What is a recurrence relation?",
      "answer": "A recurrence relation defines...",
      "topic": "definitions"
    },
    {
      "id": "card-uuid-2",
      "question": "State the Master Theorem.",
      "answer": "If T(n) = aT(n/b) + f(n)...",
      "topic": "theorems"
    }
  ]
}
```

---

### 5.4 `POST /api/decks/{deck_id}/cards`

Create a card manually.

**Auth:** Required

**Request Body**
```json
{
  "question": "What is Big-O notation?",
  "answer": "Big-O describes the upper bound...",
  "topic": "complexity"
}
```

**Response 201**
```json
{
  "id": "card-uuid-3",
  "deck_id": "deck-uuid",
  "question": "What is Big-O notation?",
  "answer": "Big-O describes the upper bound...",
  "topic": "complexity"
}
```

---

### 5.5 `PATCH /api/cards/{card_id}`

Update a flashcard.

**Auth:** Required

**Request Body**
```json
{
  "question": "What does Big-O notation represent?",
  "answer": "It represents an upper bound on growth rate."
}
```

**Response 200**
```json
{
  "id": "card-uuid-3",
  "question": "What does Big-O notation represent?",
  "answer": "It represents an upper bound on growth rate.",
  "topic": "complexity"
}
```

---

### 5.6 `DELETE /api/cards/{card_id}`

Delete a flashcard.

**Auth:** Required

**Response 204** (no body)

---

### 5.7 `GET /api/classes/{class_id}/decks`

List decks for a class.

**Auth:** Required

**Response 200**
```json
{
  "decks": [
    {
      "id": "deck-uuid",
      "title": "Midterm 1 Key Concepts",
      "public": true,
      "card_count": 42
    }
  ]
}
```

---

## 6. Comments

### 6.1 `GET /api/sessions/{session_id}/comments`

Get comments for a session (usually attached to notes).

**Auth:** Required

**Response 200**
```json
{
  "comments": [
    {
      "id": "comment-uuid",
      "session_id": "session-uuid",
      "user": {
        "id": "user-uuid",
        "name": "Justin"
      },
      "text": "Can someone explain this example?",
      "created_at": "2025-11-15T13:00:00Z"
    }
  ]
}
```

---

### 6.2 `POST /api/sessions/{session_id}/comments`

Create a comment.

**Auth:** Required

**Request Body**
```json
{
  "text": "Can someone explain this example?",
  "note_id": "notes-merged",     // optional: reference which note
  "anchor": "line-42"           // optional: anchor to a specific part
}
```

**Response 201**
```json
{
  "id": "comment-uuid",
  "session_id": "session-uuid",
  "user_id": "user-uuid",
  "text": "Can someone explain this example?",
  "created_at": "2025-11-15T13:00:00Z"
}
```

---

## 7. Upvotes / Reactions

### 7.1 `POST /api/upvotes`

Create or toggle an upvote on a note or deck.

**Auth:** Required

**Request Body**
```json
{
  "target_id": "notes-merged",
  "target_type": "note"        // "note" | "deck"
}
```

**Response 200**
```json
{
  "target_id": "notes-merged",
  "target_type": "note",
  "upvoted": true,
  "total_upvotes": 5
}
```

---

### 7.2 `GET /api/upvotes/{target_type}/{target_id}`

Get upvote count and whether the current user has upvoted.

**Auth:** Required

**Response 200**
```json
{
  "target_id": "notes-merged",
  "target_type": "note",
  "total_upvotes": 5,
  "current_user_upvoted": true
}
```

---

## 8. Study Mode

### 8.1 `POST /api/decks/{deck_id}/study/start`

Start or resume a study session.

**Auth:** Required

**Request Body (optional)**
```json
{
  "limit": 20,
  "mode": "review_weak"     // or "all"
}
```

**Response 200**
```json
{
  "deck_id": "deck-uuid",
  "cards": [
    {
      "id": "card-uuid-1",
      "question": "What is a recurrence relation?",
      "answer": "A recurrence relation defines..."
    }
  ]
}
```

---

### 8.2 `POST /api/study_events`

Record a study event (card reviewed).

**Auth:** Required

**Request Body**
```json
{
  "card_id": "card-uuid-1",
  "deck_id": "deck-uuid",
  "result": "good",       // "again" | "hard" | "good" | "easy"
  "elapsed_ms": 8000
}
```

**Response 201**
```json
{
  "status": "ok"
}
```

---

## 9. Health

### 9.1 `GET /api/health`

Health check.

**Auth:** Public

**Response 200**
```json
{
  "status": "ok",
  "time": "2025-11-15T13:30:00Z"
}
```

---

This API contract is meant as a baseline. During implementation, fields may be refined, but these routes, shapes, and semantics should remain stable enough to build the frontend against.
