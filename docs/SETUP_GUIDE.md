# MountainMerge Supabase Setup Guide

This guide will walk you through setting up Supabase for the MountainMerge application step by step.

## Prerequisites

- A Supabase account (sign up at https://supabase.com if you don't have one)
- Basic familiarity with SQL and database concepts

---

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in (or create an account)
2. Click **"New Project"** in the dashboard
3. Fill in the project details:
   - **Name**: `mountainmerge` (or any name you prefer)
   - **Database Password**: Choose a strong password (save this securely!)
   - **Region**: Choose the region closest to you
   - **Pricing Plan**: Select "Free" for development
4. Click **"Create new project"**
5. Wait 2-3 minutes for the project to be provisioned

---

## Step 2: Get Your Project Credentials

Once your project is ready:

1. Go to **Settings** (gear icon) → **API**
2. You'll need these values (save them for later):
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (keep this secret!)

3. Also note your **Database Password** from Step 1

---

## Step 3: Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Open the file `scripts/setup_database.sql` from this project
4. Copy the entire contents of that file
5. Paste it into the SQL Editor
6. Click **"Run"** (or press `Ctrl+Enter` / `Cmd+Enter`)

You should see a success message. The script will:
- Create all custom types (ENUMs)
- Create all tables
- Create all indexes
- Enable Row Level Security (RLS)
- Set up basic RLS policies
- Create a trigger to auto-create user profiles

---

## Step 4: Verify the Setup

1. Go to **Table Editor** (left sidebar)
2. You should see all these tables:
   - `users`
   - `classes`
   - `class_members`
   - `sessions`
   - `notes`
   - `flashcard_decks`
   - `flashcards`
   - `comments`
   - `upvotes`
   - `study_events`

3. Go to **Database** → **Types** to verify the custom types:
   - `note_type`
   - `upvote_target_type`
   - `study_result`

---

## Step 5: Configure Environment Variables

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
# Flask Configuration
FLASK_APP=app.main
FLASK_ENV=development
FLASK_DEBUG=1
SECRET_KEY=your-secret-key-here-change-in-production

# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here

# OpenAI Configuration (get from https://platform.openai.com/api-keys)
OPENAI_API_KEY=your-openai-api-key-here

# CORS (for local development)
CORS_ORIGINS=http://localhost:3000
```

**Replace:**
- `https://xxxxx.supabase.co` with your Project URL
- `your-anon-key-here` with your anon/public key
- `your-service-role-key-here` with your service_role key
- `your-secret-key-here` with a random secret string
- `your-openai-api-key-here` with your OpenAI API key

### Frontend Environment Variables

Create a `.env` file in the `frontend/` directory:

```bash
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

**Replace:**
- `https://xxxxx.supabase.co` with your Project URL
- `your-anon-key-here` with your anon/public key

---

## Step 6: Test the Connection (Optional)

You can test if everything is set up correctly:

1. **Test Supabase Connection**:
   ```bash
   cd backend
   python -c "from app.core.supabase_client import supabase; print('Connected!' if supabase else 'Failed')"
   ```

2. **Test Database Tables**:
   - Go to Supabase Dashboard → Table Editor
   - Try creating a test user manually (or wait for the first signup)

---

## Schema Verification

The database schema has been verified against the application requirements:

✅ **All Required Tables Present:**
- `users` - User profiles (extends Supabase auth)
- `classes` - Class workspaces
- `class_members` - Many-to-many user-class relationship
- `sessions` - Lecture/study sessions
- `notes` - AI-generated and user-edited notes
- `flashcard_decks` - Flashcard collections
- `flashcards` - Individual flashcard cards
- `comments` - Collaboration comments
- `upvotes` - Reactions/upvotes
- `study_events` - Study tracking (optional/stretch)

✅ **Relationships Verified:**
- Users ↔ Classes (via `class_members`)
- Classes → Sessions (one-to-many)
- Sessions → Notes (one-to-many)
- Classes → Flashcard Decks (one-to-many)
- Decks → Flashcards (one-to-many)
- Sessions → Comments (one-to-many)
- Notes/Decks → Upvotes (polymorphic)

✅ **Features Supported:**
- Authentication via Supabase Auth
- Class creation and joining
- Session management
- Note types: audio, slides, merged, manual
- Flashcard generation and study
- Collaboration (comments, upvotes)
- Study tracking for spaced repetition

---

## Troubleshooting

### Issue: "relation does not exist"
- **Solution**: Make sure you ran the entire `setup_database.sql` script

### Issue: "permission denied"
- **Solution**: Check that RLS policies are correctly set up. You may need to adjust policies based on your security requirements.

### Issue: "type does not exist"
- **Solution**: Make sure the ENUM types were created before the tables that use them

### Issue: Can't connect from backend
- **Solution**: 
  - Verify your `.env` file has the correct Supabase URL and keys
  - Check that you're using the `service_role` key in the backend (not the anon key)
  - Ensure your Supabase project is active (not paused)

### Issue: RLS blocking queries
- **Solution**: For development, you can temporarily disable RLS on specific tables, but this is NOT recommended for production. Instead, adjust the RLS policies to match your needs.

---

## Next Steps

After setting up the database:

1. ✅ Install backend dependencies: `pip install -r requirements.txt`
2. ✅ Install frontend dependencies: `cd frontend && npm install`
3. ✅ Start implementing authentication (Milestone 1)
4. ✅ Test the database connection from your Flask backend

---

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit `.env` files** - They're in `.gitignore` for a reason
2. **Service Role Key** - Keep this secret! Only use it in your backend, never in frontend code
3. **Anon Key** - Safe to use in frontend, but RLS policies protect your data
4. **RLS Policies** - Review and customize the RLS policies based on your security requirements
5. **Production** - Change `SECRET_KEY` and `FLASK_DEBUG=0` before deploying

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Setup complete!** You're now ready to start building MountainMerge. 🚀

