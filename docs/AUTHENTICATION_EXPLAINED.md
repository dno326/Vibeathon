# Authentication & Password Storage Explained

## How Password Authentication Works in MountainMerge

### Overview

**Passwords are NOT stored in the `users` table.** They are stored securely in Supabase's built-in authentication system.

---

## Architecture

### Two Separate Tables

1. **`auth.users`** (Supabase built-in, managed by Supabase Auth)
   - Stores: `id`, `email`, `encrypted_password`, `email_confirmed_at`, etc.
   - **Password is hashed and encrypted here**
   - You cannot directly access this table
   - Managed entirely by Supabase Auth

2. **`public.users`** (Our custom profile table)
   - Stores: `id` (references `auth.users.id`), `email`, `first_name`, `last_name`, `created_at`
   - **NO password stored here** - just profile information
   - This is what we query for user data

---

## Authentication Flow

### Signup Flow

```
User submits: email, password, first_name, last_name
    ↓
Backend calls: supabase.auth.sign_up()
    ↓
Supabase Auth:
  1. Hashes the password (bcrypt)
  2. Stores in auth.users table
  3. Creates auth.users record
    ↓
Backend creates profile in public.users table
    ↓
Returns: access_token (JWT) + user profile
```

**What happens:**
1. User provides password → Backend sends to Supabase Auth
2. Supabase hashes password (using bcrypt) → Stores in `auth.users`
3. Backend creates profile record in `public.users` (NO password)
4. User gets JWT token for future requests

### Login Flow

```
User submits: email, password
    ↓
Backend calls: supabase.auth.sign_in_with_password()
    ↓
Supabase Auth:
  1. Looks up user in auth.users by email
  2. Compares provided password with stored hash
  3. If match → creates session, returns JWT token
  4. If no match → returns error
    ↓
Backend fetches profile from public.users
    ↓
Returns: access_token (JWT) + user profile
```

**What happens:**
1. User provides email + password → Backend sends to Supabase Auth
2. Supabase looks up `auth.users` by email
3. Supabase compares password hash (you never see the actual password)
4. If correct → Returns JWT token
5. If incorrect → Returns authentication error

---

## Security Features

### Password Hashing

- **Algorithm**: bcrypt (industry standard)
- **Salt**: Automatically generated per password
- **One-way**: Cannot be reversed to get original password
- **Managed by**: Supabase Auth (you never handle raw passwords)

### Password Storage

```
auth.users table (Supabase managed):
├── id: uuid
├── email: text
├── encrypted_password: text (bcrypt hash) ← Password stored here
├── email_confirmed_at: timestamp
└── ... other auth fields

public.users table (Our profile):
├── id: uuid (references auth.users.id)
├── email: text
├── first_name: text
├── last_name: text
└── created_at: timestamp
```

### Why This is Secure

1. ✅ **Passwords never stored in plain text**
2. ✅ **Passwords never in our `users` table**
3. ✅ **Hashing done by Supabase (battle-tested)**
4. ✅ **We never see or handle raw passwords**
5. ✅ **JWT tokens for stateless authentication**

---

## Code Flow Examples

### Signup (Backend)

```python
# backend/app/services/auth_service.py

def signup(self, email: str, password: str, first_name: str, last_name: str):
    # 1. Send to Supabase Auth (handles password hashing)
    auth_response = self.supabase.auth.sign_up({
        "email": email,
        "password": password,  # ← Supabase hashes this
        "options": {
            "data": {
                "first_name": first_name,
                "last_name": last_name
            }
        }
    })
    
    # 2. Password is now hashed and stored in auth.users
    # 3. Create profile in public.users (NO password)
    self.supabase.table('users').insert({
        'id': user_id,
        'email': email,
        'first_name': first_name,
        'last_name': last_name
        # ← NO password field!
    }).execute()
```

### Login (Backend)

```python
# backend/app/services/auth_service.py

def login(self, email: str, password: str):
    # 1. Send credentials to Supabase Auth
    auth_response = self.supabase.auth.sign_in_with_password({
        "email": email,
        "password": password  # ← Supabase compares this with hash
    })
    
    # 2. Supabase verifies password against auth.users
    # 3. If correct, returns JWT token
    # 4. We fetch profile from public.users
    user_profile = self.supabase.table('users').select('*').eq('id', user_id).execute()
    
    # Returns token + profile (NO password)
    return {
        'user': user_profile.data,
        'access_token': auth_response.session.access_token
    }
```

---

## What You Can Access

### ✅ You CAN access:
- User profile data (`first_name`, `last_name`, `email`)
- User ID
- Created timestamp
- JWT tokens (for authentication)

### ❌ You CANNOT access:
- Raw passwords (never stored)
- Password hashes (in `auth.users`, not accessible)
- `auth.users` table directly (Supabase managed)

---

## Token-Based Authentication

After login, users get a **JWT (JSON Web Token)**:

```
User logs in
    ↓
Supabase verifies password
    ↓
Returns: JWT token (contains user ID, email, expiration)
    ↓
Frontend stores token in localStorage
    ↓
All future requests include: Authorization: Bearer <token>
    ↓
Backend verifies token (not password) for each request
```

**Benefits:**
- ✅ Stateless (no server-side sessions)
- ✅ Secure (tokens expire)
- ✅ Fast (no password check on every request)
- ✅ Scalable (works across multiple servers)

---

## Verification Process

### When User Logs In:

1. **Frontend** → Sends `email` + `password` to backend
2. **Backend** → Forwards to `supabase.auth.sign_in_with_password()`
3. **Supabase Auth** → 
   - Looks up user in `auth.users` by email
   - Retrieves stored password hash
   - Hashes the provided password
   - Compares hashes
   - If match → Creates session, returns JWT
   - If no match → Returns error
4. **Backend** → Returns token + user profile
5. **Frontend** → Stores token, uses for future requests

### When User Makes Authenticated Request:

1. **Frontend** → Sends request with `Authorization: Bearer <token>`
2. **Backend** → Extracts token from header
3. **Backend** → Calls `supabase.auth.get_user(token)` to verify
4. **Supabase** → Validates token signature and expiration
5. **Backend** → If valid, processes request
6. **Backend** → If invalid, returns 401 Unauthorized

---

## Summary

### Password Storage
- ❌ **NOT in `public.users` table**
- ✅ **Stored in `auth.users` table (Supabase managed)**
- ✅ **Hashed with bcrypt (one-way encryption)**

### Password Verification
- ✅ **Handled by Supabase Auth**
- ✅ **You call `sign_in_with_password()` with email + password**
- ✅ **Supabase compares hash internally**
- ✅ **You never see or handle the hash**

### Authentication After Login
- ✅ **Uses JWT tokens (not passwords)**
- ✅ **Token verified on each request**
- ✅ **No password needed after initial login**

---

## Best Practices

1. ✅ **Never store passwords in your tables**
2. ✅ **Always use Supabase Auth for password operations**
3. ✅ **Never log or expose passwords**
4. ✅ **Use HTTPS in production**
5. ✅ **Tokens expire automatically (Supabase handles this)**

---

**Your implementation is correct!** The password is securely handled by Supabase Auth, and you never need to worry about hashing or verification. 🎉

