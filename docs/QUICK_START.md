# MountainMerge Quick Start Guide

## ✅ Setup Complete!

Your MountainMerge project is fully configured and ready for development.

---

## Backend Status

### ✅ Dependencies Installed
- Flask 3.0.0
- Flask-CORS 4.0.0
- Supabase 2.0.0
- OpenAI 1.3.0
- Pydantic 2.5.0
- All other required packages

### ✅ Configuration Verified
- **SECRET_KEY**: Generated and secure (43 characters)
- **Supabase**: Connected (`https://smgstyptklhcmtzfwjxn.supabase.co`)
- **Flask**: Configured (development mode, debug enabled)
- **CORS**: Allowed origins set (`http://localhost:3000`)

### ✅ Flask App Status
- **App created**: ✅ Successfully
- **Blueprints registered**: 9 routes
  - `/api/auth` - Authentication
  - `/api/classes` - Class management
  - `/api/sessions` - Session management
  - `/api/notes` - Notes
  - `/api/decks` - Flashcard decks
  - `/api/cards` - Individual flashcards
  - `/api/comments` - Comments
  - `/api/upvotes` - Upvotes
  - `/api/study` - Study tracking
- **Health endpoint**: ✅ Working (`/api/health` returns 200 OK)

---

## How to Run the Backend

### Activate Virtual Environment
```bash
cd backend
source venv/bin/activate
```

### Start Flask Server
```bash
# Option 1: Using Flask CLI
flask run

# Option 2: Using Python directly
python -m app.main

# Option 3: Using the script
../scripts/dev_backend.sh
```

The server will start on `http://localhost:5000`

### Test the Health Endpoint
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{"status": "ok", "time": "2025-11-15T13:30:00Z"}
```

---

## Frontend Status

### ✅ Environment Variables
- API URL: `http://localhost:5000/api`
- Supabase URL: Configured
- Supabase Anon Key: Configured

### To Start Frontend
```bash
cd frontend
npm install  # If not already done
npm start
```

The frontend will start on `http://localhost:3000`

---

## Development Workflow

### 1. Start Backend
```bash
cd backend
source venv/bin/activate
flask run
```

### 2. Start Frontend (in another terminal)
```bash
cd frontend
npm start
```

### 3. Or Use the Scripts
```bash
# Start both (requires terminal multiplexing or separate terminals)
./scripts/dev_backend.sh
./scripts/dev_frontend.sh
```

---

## Project Structure

```
mountainmerge/
├── backend/
│   ├── venv/              # Virtual environment (git ignored)
│   ├── .env               # Environment variables (git ignored)
│   ├── app/
│   │   ├── api/           # API routes (9 blueprints)
│   │   ├── core/          # Config, Supabase, OpenAI clients
│   │   ├── models/        # Data models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # Business logic
│   │   └── utils/         # Utilities
│   └── requirements.txt   # Python dependencies
│
├── frontend/
│   ├── .env               # Environment variables (git ignored)
│   ├── src/
│   │   ├── pages/         # React pages
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── context/        # React context
│   │   └── lib/           # API client, config
│   └── package.json       # Node dependencies
│
└── docs/                  # Documentation
```

---

## Next Steps

### 1. Database Setup
If you haven't already, run the database setup:
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `scripts/setup_database.sql`
3. Run the script to create all tables

### 2. Start Building Features
Begin with **Milestone 1: Authentication**:
- Implement signup/login endpoints
- Connect to Supabase Auth
- Create protected route middleware

### 3. Test Your Setup
```bash
# Test backend
cd backend
source venv/bin/activate
python -c "from app import create_app; app = create_app(); print('✅ Backend ready')"

# Test frontend (after npm install)
cd frontend
npm start
```

---

## Troubleshooting

### Backend won't start
- **Issue**: Module not found
- **Solution**: Activate virtual environment: `source venv/bin/activate`

### Supabase connection fails
- **Issue**: Invalid credentials
- **Solution**: Check `backend/.env` has correct `SUPABASE_URL` and keys

### CORS errors
- **Issue**: Frontend can't connect to backend
- **Solution**: Verify `CORS_ORIGINS` in `backend/.env` includes frontend URL

### Environment variables not loading
- **Issue**: Config shows empty values
- **Solution**: Ensure `backend/.env` exists and `python-dotenv` is installed

---

## API Endpoints Available

All endpoints are registered but need implementation:

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/classes` - Create class
- `POST /api/classes/join` - Join class
- `GET /api/classes` - List user's classes
- `GET /api/classes/{id}` - Get class details
- `POST /api/sessions/audio` - Create session from audio
- `POST /api/sessions/slides` - Create session from slides
- `GET /api/sessions/{id}` - Get session
- `GET /api/health` - Health check ✅ **Working**

See `docs/mountainmerge_api_contracts.md` for full API documentation.

---

## Security Checklist

- ✅ `.env` files in `.gitignore`
- ✅ `SECRET_KEY` is secure random string
- ✅ Service role key only in backend
- ✅ Virtual environment excluded from git
- ⚠️ Remember to set `FLASK_DEBUG=0` in production
- ⚠️ Generate new `SECRET_KEY` for production

---

## Resources

- **API Contracts**: `docs/mountainmerge_api_contracts.md`
- **Database Schema**: `docs/mountainmerge_db_schema.md`
- **Setup Guide**: `docs/SETUP_GUIDE.md`
- **Flask Config**: `docs/FLASK_CONFIG.md`
- **Environment Setup**: `docs/ENV_SETUP.md`

---

**You're all set! Happy coding! 🚀**

