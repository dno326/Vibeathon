# Port 5000 Conflict Fix

## Problem

Port 5000 is being used by **macOS AirPlay Receiver** (AirTunes), not Flask. This causes a 403 Forbidden error when trying to access the backend.

## Solution

We've changed the backend to run on **port 5001** instead.

## Steps to Fix

### 1. Stop the Current Flask Server

Press `Ctrl+C` in the terminal where Flask is running.

### 2. Update Frontend Environment Variable

Update `frontend/.env`:

```bash
# Change this line:
REACT_APP_API_URL=http://localhost:5000/api

# To this:
REACT_APP_API_URL=http://localhost:5001/api
```

### 3. Restart Backend on Port 5001

```bash
cd backend
source venv/bin/activate
flask run --port 5001
```

Or use the run script:
```bash
cd backend
source venv/bin/activate
python run.py
```

### 4. Restart Frontend

The frontend should automatically pick up the new API URL from `.env`.

### 5. Test

Try signing up again. It should work now!

## Alternative: Disable AirPlay Receiver

If you prefer to use port 5000:

1. Go to **System Settings** → **General** → **AirDrop & Handoff**
2. Turn off **AirPlay Receiver**

Then restart Flask on port 5000.

## Verification

Test the backend is working:

```bash
curl http://localhost:5001/api/health
```

Should return: `{"status":"ok","time":"..."}`

---

**The backend code has been updated to use port 5001 by default.**

