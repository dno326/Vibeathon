# Environment Variables Setup Guide

This guide explains how environment variables are configured for MountainMerge and how to keep secrets safe in a public repository.

## Security Overview

✅ **Safe to commit:**
- `.env.example` files (template files with placeholder values)
- Configuration code that reads from environment variables

❌ **NEVER commit:**
- `.env` files (contain actual secrets)
- Any file with real API keys, passwords, or tokens

## File Structure

```
mountainmerge/
├── backend/
│   ├── .env              # ❌ Git ignored - contains real secrets
│   └── .env.example      # ✅ Safe to commit - template only
├── frontend/
│   ├── .env              # ❌ Git ignored - contains real secrets
│   └── .env.example      # ✅ Safe to commit - template only
└── .gitignore            # Ensures .env files are never committed
```

## Backend Environment Variables

Location: `backend/.env`

### Required Variables

```bash
# Flask Configuration
FLASK_APP=app.main
FLASK_ENV=development
FLASK_DEBUG=1
SECRET_KEY=your-secret-key-here

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-public-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here

# OpenAI Configuration (optional for now)
OPENAI_API_KEY=your-openai-api-key-here

# CORS Configuration
CORS_ORIGINS=http://localhost:3000
```

### How to Set Up

1. Copy the example file:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Edit `backend/.env` and replace placeholder values with your actual credentials:
   - Get Supabase credentials from: Supabase Dashboard → Settings → API
   - Generate a random `SECRET_KEY` for Flask sessions

3. **Never commit `backend/.env`** - it's already in `.gitignore`

### Security Notes

- ✅ **SUPABASE_SERVICE_KEY**: Safe to use in backend (server-side only)
- ❌ **SUPABASE_SERVICE_KEY**: NEVER use in frontend code
- ✅ **SUPABASE_KEY** (anon key): Can be used in frontend (protected by RLS)
- 🔒 **SECRET_KEY**: Use a strong random string in production

## Frontend Environment Variables

Location: `frontend/.env`

### Required Variables

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-public-key-here
```

### How to Set Up

1. Copy the example file:
   ```bash
   cp frontend/.env.example frontend/.env
   ```

2. Edit `frontend/.env` and replace placeholder values with your actual credentials

3. **Never commit `frontend/.env`** - it's already in `.gitignore`

### Security Notes

- ✅ **REACT_APP_SUPABASE_ANON_KEY**: Safe to expose in frontend (protected by Row Level Security)
- ❌ **Service Role Key**: NEVER put in frontend `.env` or frontend code
- ⚠️ **REACT_APP_***: React requires the `REACT_APP_` prefix for environment variables

## Verification

### Check if .env files are ignored:

```bash
git check-ignore backend/.env frontend/.env
```

If both files are listed, they're properly ignored ✅

### Test Backend Configuration:

```bash
cd backend
python -c "from app.core.config import Config; print('SUPABASE_URL:', Config.SUPABASE_URL[:30] + '...' if Config.SUPABASE_URL else 'NOT SET')"
```

### Test Frontend Configuration:

The frontend will read environment variables at build time. After setting up `.env`, restart your React dev server:

```bash
cd frontend
npm start
```

## Troubleshooting

### Issue: Environment variables not loading

**Backend:**
- Make sure `python-dotenv` is installed: `pip install python-dotenv`
- Check that `backend/.env` exists and has correct values
- Verify `load_dotenv()` is called in `app/core/config.py`

**Frontend:**
- Make sure variable names start with `REACT_APP_`
- Restart the React dev server after changing `.env`
- Check browser console for any errors

### Issue: "Cannot find module" or import errors

- Make sure you're in the correct directory
- Verify all dependencies are installed:
  ```bash
  # Backend
  pip install -r requirements.txt
  
  # Frontend
  cd frontend && npm install
  ```

### Issue: Supabase connection fails

- Verify your `SUPABASE_URL` is correct (should be `https://[project-id].supabase.co`)
- Check that your keys are correct (no extra spaces or quotes)
- Ensure your Supabase project is active (not paused)

## Production Deployment

When deploying to production:

1. **Set environment variables in your hosting platform:**
   - Heroku: `heroku config:set KEY=value`
   - Vercel: Project Settings → Environment Variables
   - AWS/GCP: Use their secrets management services

2. **Never hardcode secrets in code**

3. **Use different keys for production:**
   - Create a separate Supabase project for production
   - Use production API keys, not development keys

4. **Rotate keys if exposed:**
   - If you accidentally commit secrets, rotate them immediately
   - Supabase: Settings → API → Reset keys

## Best Practices

1. ✅ Always use `.env.example` as a template
2. ✅ Add `.env` to `.gitignore` (already done)
3. ✅ Never commit `.env` files
4. ✅ Use different keys for dev/staging/production
5. ✅ Rotate keys regularly
6. ✅ Use strong, random `SECRET_KEY` values
7. ✅ Review `.gitignore` before committing

---

**Your environment is now set up securely!** 🎉

