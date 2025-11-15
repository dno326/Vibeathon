# InSync — Master Product & Development Specification

## 1. Product Overview
InSync is a collaborative, AI‑powered study platform that helps students capture lecture content, transform it into clean structured notes, automatically generate flashcards, and collaborate inside shared class workspaces. It integrates audio transcription, slide extraction, summarization, flashcard generation, and social study features.

## 2. Core User Flows
### 2.1 Join InSync
- User signs up or logs in using Supabase authentication.
- User creates or joins class spaces using invite links or class codes.
- User lands in the class dashboard showing sessions, notes, decks, and collaborators.

### 2.2 Upload Lecture Audio
- User uploads audio (.wav, .mp3, .m4a).
- Whisper transcribes audio.
- GPT converts transcript to structured notes.
- Notes saved within a “Session” in the class workspace.

### 2.3 Upload Slides / PDF
- User uploads PDF, PPTX, or images.
- Backend extracts text via OCR and parsing.
- GPT summarizes each slide and produces a unified outline.
- Notes stored as a “Session.”

### 2.4 Generate Flashcards
- User selects a Session or notes.
- GPT generates flashcards (definitions, Q&A, explanations).
- User edits or deletes cards.
- Deck stored as personal or shared.

### 2.5 Shared Class Workspace
- Users see all shared notes, sessions, and decks.
- Users can comment, upvote, or suggest edits.
- Decks can be shared to class.

### 2.6 Study Mode
- Flashcards presented one at a time.
- User records confidence.
- Simple spaced repetition logic improves review order.

---

## 3. Feature List
### 3.1 Accounts & Classes
- Login / signup.
- Create or join classes.
- Class dashboard with sessions, decks, and collaborators.

### 3.2 Lecture Audio Processing
- Audio upload.
- Whisper transcription.
- GPT‑generated structured notes.

### 3.3 Slide/PDF Processing
- PDF/PPTX/image upload.
- OCR and text parsing.
- GPT summarization and outline creation.

### 3.4 Note Management
- Sessions represent individual lectures.
- Editable note viewer.
- Merge notes from audio, slides, or manual input.
- Tag notes by week or topic.

### 3.5 Flashcards
- Auto‑generation from notes.
- Manual editing.
- Deck privacy controls.
- Tagging for topics and difficulty.
- Simple spaced repetition.

### 3.6 Collaboration Tools
- Shared Master Notes for each class.
- Commenting on notes.
- Upvotes on notes and flashcards.
- Shared decks visible to all.
- Study rooms with presence indicators (stretch).

### 3.7 Study & Productivity
- Study dashboard.
- Review metrics.
- Lightweight exam‑study planner.

---

## 4. User Stories
### As a student, I want to:
1. Upload audio and receive clean structured notes.
2. Upload slides and get a summarized study sheet.
3. Merge notes from different sources.
4. Auto‑generate flashcards from notes.
5. Edit and manage flashcards.
6. Join classes and access shared notes.
7. Share decks with classmates.
8. Comment on confusing note sections.
9. Upvote helpful content.
10. Review flashcards in study mode.
11. Track my weak topics.
12. Generate study plans before exams.

---

## 5. MVP Scope
### Must Have
- Auth + join/create classes.
- Audio upload → transcription → AI notes.
- Slide upload → text extraction → AI summary.
- Notes → flashcards.
- Shared class workspace.
- Flashcard viewer/editor.

### Nice to Have
- Note comments.
- Deck upvotes.
- Topic tagging.
- Progress tracking.

### Stretch
- Study rooms.
- Real‑time collaboration.
- Full spaced repetition engine.
- Audio‑slide alignment.
- Smart study planner.

---

## 6. Technical Architecture
### Frontend
- React + Vite.
- Tailwind CSS.
- Pages:
  - Login/signup
  - Dashboard
  - Class home
  - Session page
  - Flashcard deck page
  - Study mode
  - Profile

### Backend (Flask)
REST endpoints for:
- Auth/user
- Class creation/join
- Session creation
- Audio upload
- Slide upload
- Note generation
- Flashcard creation
- Comments
- Upvotes
- Deck sharing

### Supabase Tables
- users
- classes
- class_members
- sessions
- notes
- flashcard_decks
- flashcards
- comments
- upvotes

### AI Workflows
- Whisper STT
- GPT summarization
- GPT flashcard generation

---

## 7. Development Milestones (Expanded)

### Milestone 1 — Core Structure & Authentication (2–4 hours)
**Goals**
- Set up project folder structure (frontend + backend).
- Initialize React, Tailwind, Flask, and Supabase.
- Implement authentication and protected routes.

**Deliverables**
- Login/signup screens.
- Backend authentication middleware.
- Users able to log in, remain authenticated, and log out.

---

### Milestone 2 — Class Infrastructure (3–5 hours)
**Goals**
- Create class creation and class join flows.
- Implement class dashboard fetching sessions and decks.

**Deliverables**
- “Create class” modal.
- “Join class” with code.
- Class dashboard layout.
- Supabase tables for classes/class_members.

---

### Milestone 3 — Audio Processing Pipeline (5–7 hours)
**Goals**
- Build audio upload UI.
- Implement backend Whisper transcription.
- Build GPT note generation endpoint.
- Store transcript + notes in DB.

**Deliverables**
- Audio upload → transcript → structured notes.
- Session page showing generated notes.

---

### Milestone 4 — Slide/PDF Processing Pipeline (5–7 hours)
**Goals**
- Add slide/PDF upload UI.
- Backend OCR & text extraction pipeline.
- GPT summary generation.
- Store as Session.

**Deliverables**
- PDF → summarized outline.
- Session created with extracted notes.

---

### Milestone 5 — Notes Management (3–6 hours)
**Goals**
- Build note editor component.
- Allow editing and saving notes.
- Merge audio-derived notes and slide-derived notes.

**Deliverables**
- Rich text editor.
- “Master note” view for each Session.

---

### Milestone 6 — Flashcards System (6–8 hours)
**Goals**
- Generate flashcards from notes.
- Build deck system.
- Build card viewer & study mode.

**Deliverables**
- Deck creation.
- Auto-generated cards.
- Study mode with confidence tracking.

---

### Milestone 7 — Collaboration (6–8 hours)
**Goals**
- Comments on notes.
- Upvotes on notes and flashcards.
- Shared decks.

**Deliverables**
- Threaded comments.
- Upvote buttons.
- Shared decks visible in class space.

---

### Milestone 8 — Final Polish / Hackathon Demo (2–4 hours)
**Goals**
- Improve UI design.
- Add loading states & smooth transitions.
- Prepare example classes and sessions.
- Build a clean 2–3 minute demo flow.

**Deliverables**
- Fully working polished InSync MVP.
- Demo script and test data.

