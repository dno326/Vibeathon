# Signup Fix: Database Migration Required

## Issue Found

Your Supabase `users` table currently has the **old schema** with a `name` column, but the code now expects `first_name` and `last_name` columns.

## Quick Fix Steps

### 1. Run the Migration Script

1. Go to your **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Click **"New query"**
5. Open the file: `scripts/migrate_users_to_first_last_name.sql`
6. Copy the entire contents
7. Paste into the SQL Editor
8. Click **"Run"** (or press `Ctrl+Enter` / `Cmd+Enter`)

### 2. Verify Migration

After running the migration, verify it worked:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users';
```

You should see:
- `id`
- `email`
- `first_name` ✅
- `last_name` ✅
- `created_at`

**NOT** `name` ❌

### 3. Test Signup

1. Make sure backend is running: `cd backend && source venv/bin/activate && flask run`
2. Make sure frontend is running: `cd frontend && npm start`
3. Try signing up with first name and last name
4. Check Supabase Dashboard → Table Editor → users table
5. Verify `first_name` and `last_name` are saved correctly

## What Changed

### Database Schema
- **Before**: `users.name` (single text field)
- **After**: `users.first_name` and `users.last_name` (two text fields)

### Backend
- `auth_service.signup()` now accepts `first_name` and `last_name`
- All user responses include `first_name` and `last_name`

### Frontend
- Signup form now has separate "First Name" and "Last Name" fields
- User interface displays full name as `{first_name} {last_name}`

## Troubleshooting

### Error: "column users.first_name does not exist"
- **Solution**: Run the migration script (see Step 1 above)

### Error: "column users.name does not exist"  
- **Solution**: You already migrated! The code is correct, but you might have old cached data. Clear browser cache.

### Network Error on Signup
- Check backend is running on `http://localhost:5000`
- Check CORS is configured in `backend/.env`: `CORS_ORIGINS=http://localhost:3000`
- Check browser console for detailed error messages
- Check backend terminal for error logs

### Signup succeeds but user not in database
- Check the trigger function `handle_new_user()` is updated
- Verify RLS policies allow inserts
- Check backend logs for any errors during profile creation

## Migration Script Location

`scripts/migrate_users_to_first_last_name.sql`

This script will:
1. Add `first_name` and `last_name` columns
2. Migrate existing `name` data (splits on first space)
3. Drop the old `name` column
4. Update the trigger function

---

**After migration, signup should work perfectly!** 🎉

