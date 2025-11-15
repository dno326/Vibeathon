# Flask Backend Configuration Guide

This document explains all the Flask backend environment variables and keys needed for MountainMerge.

## Required Environment Variables

### 1. Flask Core Configuration

#### `SECRET_KEY` ⚠️ **CRITICAL**
- **Purpose**: Used for Flask sessions, CSRF protection, cookie signing, and cryptographic operations
- **Type**: String (random, secure)
- **Generated**: ✅ Already generated and set in `backend/.env`
- **Security**: **NEVER commit this to git** - it's in `.gitignore`
- **Production**: Use a different, strong random key for production

**Current Value**: `gacoyFW47epFuLMBsIxpICKbY_7QNViHb_NuKqHVtHk`

**To generate a new one:**
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

#### `FLASK_APP`
- **Purpose**: Tells Flask which module contains the application
- **Value**: `app.main`
- **Required**: Yes (for `flask run` command)

#### `FLASK_ENV`
- **Purpose**: Sets Flask environment mode
- **Values**: `development` | `production`
- **Current**: `development`
- **Note**: In production, set to `production`

#### `FLASK_DEBUG`
- **Purpose**: Enables/disables Flask debug mode
- **Values**: `1` (enabled) | `0` (disabled)
- **Current**: `1` (development)
- **Production**: **MUST be `0`** for security

---

### 2. Supabase Configuration

#### `SUPABASE_URL`
- **Purpose**: Your Supabase project URL
- **Format**: `https://[project-id].supabase.co`
- **Current**: `https://smgstyptklhcmtzfwjxn.supabase.co`
- **Required**: ✅ Yes

#### `SUPABASE_KEY`
- **Purpose**: Supabase anon/public key (for general queries)
- **Usage**: Can be used for client-side operations
- **Current**: ✅ Set in `.env`
- **Required**: ✅ Yes

#### `SUPABASE_SERVICE_KEY` ⚠️ **SECRET**
- **Purpose**: Supabase service role key (bypasses RLS)
- **Usage**: **Backend only** - for admin operations
- **Security**: **NEVER expose to frontend**
- **Current**: ✅ Set in `.env`
- **Required**: ✅ Yes

---

### 3. OpenAI Configuration

#### `OPENAI_API_KEY`
- **Purpose**: For Whisper transcription and GPT note/flashcard generation
- **Current**: Placeholder (`your-openai-api-key-here`)
- **Required**: ⚠️ Optional for now, but needed for AI features
- **Get it from**: https://platform.openai.com/api-keys

---

### 4. CORS Configuration

#### `CORS_ORIGINS`
- **Purpose**: Allowed origins for Cross-Origin Resource Sharing
- **Format**: Comma-separated URLs
- **Current**: `http://localhost:3000` (React dev server)
- **Production**: Update to your production frontend URL(s)
- **Example**: `http://localhost:3000,https://mountainmerge.app`

---

## Current Configuration Summary

```bash
# Flask Core
SECRET_KEY=gacoyFW47epFuLMBsIxpICKbY_7QNViHb_NuKqHVtHk  ✅ Generated
FLASK_APP=app.main                                      ✅ Set
FLASK_ENV=development                                   ✅ Set
FLASK_DEBUG=1                                           ✅ Set (dev mode)

# Supabase
SUPABASE_URL=https://smgstyptklhcmtzfwjxn.supabase.co   ✅ Configured
SUPABASE_KEY=[anon key]                                 ✅ Configured
SUPABASE_SERVICE_KEY=[service key]                      ✅ Configured

# OpenAI
OPENAI_API_KEY=your-openai-api-key-here                 ⚠️ Placeholder

# CORS
CORS_ORIGINS=http://localhost:3000                      ✅ Set
```

---

## How Flask Uses These Variables

### SECRET_KEY Usage

Flask uses `SECRET_KEY` for:

1. **Session Management** (if using Flask sessions):
   ```python
   from flask import session
   session['user_id'] = user_id  # Signed with SECRET_KEY
   ```

2. **CSRF Protection** (if using Flask-WTF):
   ```python
   # CSRF tokens are signed with SECRET_KEY
   ```

3. **Cookie Signing**:
   ```python
   # Flask signs cookies to prevent tampering
   ```

4. **Cryptographic Operations**:
   - Token generation
   - Secure random operations
   - Any crypto that needs a secret

### Authentication Flow

Since we're using **Supabase Auth** (not Flask sessions), the flow is:

1. User authenticates via Supabase → Gets JWT token
2. Frontend sends JWT in `Authorization: Bearer <token>` header
3. Backend verifies token with Supabase (using `SUPABASE_SERVICE_KEY`)
4. No Flask sessions needed - stateless JWT authentication

**Note**: Even though we're not using Flask sessions, `SECRET_KEY` is still required by Flask and may be used by other extensions.

---

## Verification

### Test Configuration Loading

```bash
cd backend
python3 -c "from app.core.config import Config; print('✅ Config loaded successfully'); print(f'SECRET_KEY: {Config.SECRET_KEY[:20]}...'); print(f'SUPABASE_URL: {Config.SUPABASE_URL}')"
```

### Test Flask App Creation

```bash
cd backend
python3 -c "from app import create_app; app = create_app(); print('✅ Flask app created successfully')"
```

### Test Supabase Connection

```bash
cd backend
python3 -c "from app.core.supabase_client import supabase; print('✅ Supabase client initialized')"
```

---

## Production Checklist

Before deploying to production:

- [ ] Generate a new, strong `SECRET_KEY` (don't reuse dev key)
- [ ] Set `FLASK_ENV=production`
- [ ] Set `FLASK_DEBUG=0`
- [ ] Update `CORS_ORIGINS` to production frontend URL(s)
- [ ] Use production Supabase project (or same one if appropriate)
- [ ] Set `OPENAI_API_KEY` with production key
- [ ] Verify all secrets are set in hosting platform (not in code)
- [ ] Never commit `.env` file to git

---

## Security Best Practices

1. ✅ **SECRET_KEY is generated** - Using cryptographically secure random string
2. ✅ **SECRET_KEY is in .gitignore** - Never committed to git
3. ✅ **Service key only in backend** - Never exposed to frontend
4. ✅ **Debug mode only in development** - Disabled in production
5. ⚠️ **Rotate keys if exposed** - If secrets leak, rotate immediately

---

## Troubleshooting

### Issue: "SECRET_KEY not set" warning

**Solution**: Make sure `backend/.env` exists and has `SECRET_KEY` set

### Issue: CORS errors from frontend

**Solution**: 
- Check `CORS_ORIGINS` includes your frontend URL
- Restart Flask server after changing `.env`

### Issue: Supabase connection fails

**Solution**:
- Verify `SUPABASE_URL` is correct (full URL, not just project ID)
- Check that keys are correct (no extra spaces)
- Ensure Supabase project is active

### Issue: OpenAI API errors

**Solution**:
- Set `OPENAI_API_KEY` in `backend/.env`
- Verify key is valid at https://platform.openai.com/api-keys
- Check your OpenAI account has credits/quota

---

## Additional Flask Configuration (Optional)

If you need to add more Flask settings later, add them to `backend/app/core/config.py`:

```python
class Config:
    # ... existing config ...
    
    # Additional Flask settings
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max upload
    UPLOAD_FOLDER = 'uploads'
    ALLOWED_EXTENSIONS = {'mp3', 'wav', 'm4a', 'pdf', 'pptx'}
```

Then add to `backend/.env`:
```bash
MAX_CONTENT_LENGTH=16777216
UPLOAD_FOLDER=uploads
```

---

**Your Flask backend is now fully configured!** 🎉

All required keys are set and secure. You can start developing the backend API.

