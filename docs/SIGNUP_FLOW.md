# Signup Flow - Complete Explanation

This document explains the complete signup flow step-by-step to help understand and debug issues.

---

## Overview

When a user signs up, we need to:
1. Create the user in Supabase Auth (`auth.users` table)
2. Create a profile in our database (`public.users` table)
3. Auto-confirm the email (for development)
4. Return user data and access token

---

## Step-by-Step Flow

### Step 1: User Calls Signup Endpoint

**Frontend** → `POST /api/auth/signup`
```json
{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Backend Route**: `backend/app/api/auth_routes.py`
- Validates input (email, password, first_name, last_name)
- Calls `auth_service.signup()`

---

### Step 2: Create User in Supabase Auth

**Code**: `backend/app/services/auth_service.py` → `signup()` method

```python
auth_response = self.supabase.auth.sign_up({
    "email": email,
    "password": password,
    "options": {
        "data": {
            "first_name": first_name,
            "last_name": last_name
        },
        "email_redirect_to": None
    }
})
```

**What happens:**
- Supabase Auth creates user in `auth.users` table
- Password is hashed (bcrypt) and stored
- User metadata (first_name, last_name) is stored in `raw_user_meta_data`
- Returns `auth_response` with:
  - `user` object (contains `id`, `email`, etc.)
  - `session` object (contains `access_token`)

**Database State:**
- ✅ User exists in `auth.users`
- ❌ Profile does NOT exist in `public.users` yet

---

### Step 3: Get User ID

```python
user_id = auth_response.user.id
```

**What happens:**
- Extract the UUID of the newly created user
- This ID will be used to create the profile

---

### Step 4: Create Admin Client

```python
admin_client = create_client(Config.SUPABASE_URL, Config.SUPABASE_SERVICE_KEY)
```

**What happens:**
- Creates a Supabase client with **service role key**
- Service role key **bypasses Row Level Security (RLS)**
- Needed for admin operations (confirming email, creating profiles)

**Why service role key:**
- Regular anon key is subject to RLS policies
- Service role key can perform admin operations
- Required to insert into `public.users` if RLS is enabled

---

### Step 5: Verify User Exists in auth.users

```python
user_verified = False
verification_attempts = 0
while not user_verified and verification_attempts < 5:
    admin_user = admin_client.auth.admin.get_user_by_id(user_id)
    if admin_user and admin_user.user:
        user_verified = True
    else:
        verification_attempts += 1
        time.sleep(0.2)
```

**What happens:**
- Polls up to 5 times to verify user exists in `auth.users`
- Waits 0.2 seconds between attempts
- Ensures user is fully committed before proceeding

**Why needed:**
- Sometimes there's a slight delay between `sign_up()` and user being available
- Prevents foreign key constraint errors later

---

### Step 6: Auto-Confirm Email (Development Only)

```python
admin_client.auth.admin.update_user_by_id(
    user_id,
    {"email_confirm": True}
)
```

**What happens:**
- Uses admin API to confirm the user's email
- Sets `email_confirmed_at` in `auth.users`
- Allows user to log in immediately (no email confirmation needed)

**Why:**
- In development, we want users to log in immediately
- In production, this should be removed (users confirm via email)

**Note:** If this fails, we log a warning but continue (user can still confirm via email)

---

### Step 7: Wait for Trigger to Create Profile

```python
time.sleep(1)  # Give trigger time to execute
```

**What happens:**
- Waits 1 second for the database trigger to fire
- The trigger `handle_new_user()` should automatically create profile

**Database Trigger:**
```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Trigger Function:**
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**What the trigger does:**
- Fires automatically AFTER a user is inserted into `auth.users`
- Uses `SECURITY DEFINER` to bypass RLS
- Creates profile in `public.users` with data from `auth.users`

---

### Step 8: Check if Trigger Created Profile

```python
profile = None
max_wait_attempts = 5
wait_count = 0

while wait_count < max_wait_attempts:
    profile = admin_client.table('users').select('*').eq('id', user_id).execute()
    if profile.data and len(profile.data) > 0:
        # Trigger worked! Profile exists
        break
    wait_count += 1
    if wait_count < max_wait_attempts:
        time.sleep(0.5)  # Wait a bit more
```

**What happens:**
- Polls up to 5 times to check if profile exists
- Waits 0.5 seconds between attempts
- If profile exists, we're done (trigger worked!)

**Why polling:**
- Trigger might take a moment to execute
- Database operations aren't always instant
- Gives trigger time to complete

---

### Step 9: Manual Profile Creation (If Trigger Failed)

**Only executes if:** Profile doesn't exist after waiting

```python
if not profile or not profile.data or len(profile.data) == 0:
    # Trigger failed, create manually
    time.sleep(1.5)  # Give more time for user to be committed
    
    max_insert_retries = 5
    insert_retry_count = 0
    
    while insert_retry_count < max_insert_retries:
        try:
            admin_client.table('users').insert({
                'id': user_id,
                'email': email,
                'first_name': first_name,
                'last_name': last_name
            }).execute()
            profile_inserted = True
            break
        except Exception as e:
            if '23503' in error_msg:  # Foreign key constraint
                insert_retry_count += 1
                time.sleep(1)  # Wait and retry
            elif '23505' in error_msg:  # Unique constraint (profile exists)
                # Profile was created by trigger after we checked
                profile = admin_client.table('users').select('*').eq('id', user_id).execute()
                break
```

**What happens:**
- Waits 1.5 seconds for user to be fully committed in `auth.users`
- Tries to insert profile manually
- Retries up to 5 times if foreign key constraint error (user not ready yet)
- If unique constraint error, profile exists (trigger worked late), use it

**Error Codes:**
- `23503`: Foreign key constraint violation (user not in `auth.users` yet)
- `23505`: Unique constraint violation (profile already exists)

**Final Retry:**
- After 5 retries, tries one more time with 2 second wait
- If still fails, raises error (user exists but profile can't be created)

---

### Step 10: Update Profile Names (If Needed)

```python
if existing_profile.get('first_name') != first_name or existing_profile.get('last_name') != last_name:
    admin_client.table('users').update({
        'first_name': first_name,
        'last_name': last_name
    }).eq('id', user_id).execute()
```

**What happens:**
- If trigger created profile but names are different, update them
- Ensures profile has correct data

---

### Step 11: Get Access Token

```python
try:
    session_response = self.supabase.auth.sign_in_with_password({
        "email": email,
        "password": password
    })
    access_token = session_response.session.access_token
except Exception as e:
    # Fallback to token from signup
    if auth_response.session:
        access_token = auth_response.session.access_token
```

**What happens:**
- Tries to sign in to get fresh access token (after email confirmation)
- If that fails, uses token from signup response
- Token is needed for authenticated requests

---

### Step 12: Return User Data

```python
return {
    'user': {
        'id': user_profile_data['id'],
        'email': user_profile_data['email'],
        'first_name': user_profile_data['first_name'],
        'last_name': user_profile_data['last_name'],
        'created_at': user_profile_data['created_at']
    },
    'access_token': access_token
}
```

**What happens:**
- Returns user profile data and access token
- Frontend stores token in localStorage
- User is now logged in

---

## Complete Flow Diagram

```
User submits signup form
    ↓
Backend receives request
    ↓
Call supabase.auth.sign_up()
    ↓
User created in auth.users ✅
    ↓
Get user_id
    ↓
Create admin client (service role key)
    ↓
Verify user exists in auth.users (poll up to 5 times)
    ↓
Auto-confirm email (admin API)
    ↓
Wait 1 second for trigger
    ↓
Check if trigger created profile (poll up to 5 times)
    ↓
    ├─→ Profile exists? ✅
    │       ↓
    │   Update names if needed
    │       ↓
    │   Get access token
    │       ↓
    │   Return user data ✅
    │
    └─→ Profile doesn't exist? ❌
            ↓
        Wait 1.5 seconds
            ↓
        Try to create profile manually (retry up to 5 times)
            ↓
            ├─→ Success? ✅
            │       ↓
            │   Get access token
            │       ↓
            │   Return user data ✅
            │
            └─→ Still fails? ❌
                    ↓
                Final retry (2 second wait)
                    ↓
                    ├─→ Success? ✅
                    │       ↓
                    │   Return user data ✅
                    │
                    └─→ Fails? ❌
                            ↓
                        Raise error ❌
```

---

## Potential Issues & Solutions

### Issue 1: Foreign Key Constraint Error (23503)

**Error:** `Key (id)=(...) is not present in table "users"`

**Cause:** Trying to insert into `public.users` before user is committed in `auth.users`

**Solution:**
- Wait longer (1.5 seconds)
- Retry with delays (up to 5 times)
- Verify user exists before inserting

### Issue 2: RLS Policy Violation (42501)

**Error:** `new row violates row-level security policy`

**Cause:** Using anon key instead of service role key

**Solution:**
- Use admin client (service role key) for all profile operations
- Service role key bypasses RLS

### Issue 3: Trigger Not Firing

**Cause:** 
- Trigger not set up correctly
- Trigger function has errors
- RLS blocking trigger

**Solution:**
- Check trigger exists in Supabase
- Verify trigger function is correct
- Use `SECURITY DEFINER` in trigger function
- Manual insert as fallback

### Issue 4: Profile Not Found During Login

**Cause:** Signup profile creation failed

**Solution:**
- Login now auto-creates profile if missing
- Uses user metadata from `auth.users`

---

## Key Points

1. **Two-step process**: User in `auth.users` → Profile in `public.users`
2. **Trigger should work**: But we have manual fallback
3. **Timing is critical**: Need to wait for user to be committed
4. **Service role key**: Required for admin operations
5. **Retry logic**: Handles timing issues gracefully
6. **Login safety net**: Creates profile if missing

---

## Testing the Flow

To verify signup works:

1. **Check auth.users:**
   ```sql
   SELECT id, email, email_confirmed_at 
   FROM auth.users 
   ORDER BY created_at DESC 
   LIMIT 1;
   ```

2. **Check public.users:**
   ```sql
   SELECT * FROM users 
   ORDER BY created_at DESC 
   LIMIT 1;
   ```

3. **Verify foreign key:**
   ```sql
   SELECT u.id, u.email, u.first_name, u.last_name
   FROM users u
   JOIN auth.users au ON u.id = au.id
   WHERE u.id = 'your-user-id';
   ```

---

**Last Updated**: 2025-01-15

