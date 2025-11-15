# MountainMerge File Structure Specification

This document details the recommended file structure for the **MountainMerge** project, which consists of:

- A **React frontend**
- A **Flask backend**
- Shared project-level files and development scripts

It is designed to be clear, scalable, and compatible with AI coding IDEs such as Cursor and Lovable.

---

# 1. Root Directory Structure

```
mountainmerge/
  README.md
  .gitignore
  .env                # root environment variables (never commit)
  requirements.txt    # backend dependencies
  package.json        # optional: manage frontend deps from root
  docs/
  scripts/
  frontend/
  backend/
```

---

# 2. Frontend (React) Structure

```
frontend/
  package.json
  yarn.lock / package-lock.json
  .gitignore
  .env                     # frontend env vars (REACT_APP_*)

  public/
    index.html
    favicon.ico
    manifest.json
    assets/

  src/
    index.tsx
    App.tsx

    routes/
      index.tsx            # central route definitions

    pages/
      Auth/
        LoginPage.tsx
        SignupPage.tsx
      Dashboard/
        DashboardPage.tsx
      Class/
        ClassPage.tsx
      Session/
        SessionPage.tsx
      Deck/
        DeckPage.tsx
      Study/
        StudyModePage.tsx
      Profile/
        ProfilePage.tsx

    components/
      layout/
        Navbar.tsx
        Sidebar.tsx
        PageContainer.tsx
      classes/
        ClassCard.tsx
        ClassList.tsx
      sessions/
        SessionCard.tsx
        SessionList.tsx
        NoteEditor.tsx
        AudioUpload.tsx
        FileUpload.tsx
      flashcards/
        DeckCard.tsx
        DeckList.tsx
        FlashcardView.tsx
        FlashcardEditor.tsx
        StudyControls.tsx
      comments/
        CommentList.tsx
        CommentForm.tsx
      common/
        Button.tsx
        Input.tsx
        Textarea.tsx
        Modal.tsx
        Spinner.tsx
        Tag.tsx
        EmptyState.tsx

    hooks/
      useAuth.ts
      useClass.ts
      useSession.ts
      useDeck.ts

    context/
      AuthContext.tsx
      ClassContext.tsx

    lib/
      apiClient.ts          # axios wrapper for backend calls
      config.ts             # env vars
      supabaseClient.ts     # optional direct supabase usage

    types/
      auth.ts
      user.ts
      classes.ts
      sessions.ts
      notes.ts
      flashcards.ts
      comments.ts
      api.ts

    styles/
      index.css
      variables.css

    assets/
      logo.svg
      icons/
      images/

    utils/
      classNames.ts
      formatDate.ts
      errorHandling.ts

```

---

# 3. Backend (Flask) Structure

```
backend/
  pyproject.toml / requirements.txt
  .env                        # backend environment variables
  .gitignore

  app/
    __init__.py
    main.py                   # Flask entry point

    api/
      __init__.py
      auth_routes.py
      class_routes.py
      session_routes.py
      note_routes.py
      flashcard_routes.py
      comment_routes.py
      vote_routes.py

    core/
      config.py               # environment loading, constants
      security.py             # token helpers if needed
      supabase_client.py      # wrapper for Supabase usage
      openai_client.py        # Whisper + GPT abstraction

    models/
      __init__.py
      users.py
      classes.py
      sessions.py
      notes.py
      flashcards.py
      comments.py
      votes.py

    schemas/
      __init__.py
      auth.py
      classes.py
      sessions.py
      notes.py
      flashcards.py
      comments.py
      votes.py

    services/
      __init__.py
      auth_service.py
      class_service.py
      session_service.py
      note_service.py
      flashcard_service.py
      comment_service.py
      vote_service.py
      ai_notes_service.py        # GPT-based note generation
      ai_flashcards_service.py   # GPT-based flashcard generation
      transcription_service.py   # Whisper STT pipeline
      file_service.py            # PDF/slide text extraction

    utils/
      __init__.py
      logging.py
      errors.py
      pagination.py

    tests/
      __init__.py
      test_auth.py
      test_classes.py
      test_sessions.py
```

---

# 4. Scripts

```
scripts/
  dev_frontend.sh          # start React dev server
  dev_backend.sh           # run Flask backend
  dev_all.sh               # optional: run both simultaneously
```

---

# 5. Documentation

```
docs/
  mountainmerge_file_structure.md   # this file
  MountainMerge_spec.md             # full product + feature specification
  api_contracts.md           # backend endpoint descriptions
```

---

# 6. Summary

This structure ensures:

- Clear separation between frontend and backend.
- Predictable locations for routes, services, models, and components.
- Compatibility with AI IDEs (Cursor, Lovable) that rely on predictable layouts.
- Easy scalability for additional features such as study rooms, real-time editing, or analytics.

