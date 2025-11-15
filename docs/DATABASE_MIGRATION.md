# Database Migration Guide: Name to First/Last Name

If you've already run the initial database setup and have a `users` table with a `name` column, you need to migrate to `first_name` and `last_name`.

## Option 1: Fresh Start (Recommended for Development)

If you don't have important data yet:

1. Go to Supabase Dashboard → Table Editor
2. Delete all rows from the `users` table (if any)
3. Run the migration script: `scripts/migrate_users_to_first_last_name.sql`

## Option 2: Migration Script (Preserves Data)

1. Go to Supabase Dashboard → SQL Editor
2. Run the migration script: `scripts/migrate_users_to_first_last_name.sql`

This will:
- Add `first_name` and `last_name` columns
- Migrate existing `name` data (splits on first space)
- Drop the old `name` column
- Update the trigger function

## Option 3: Manual Update (If Table Doesn't Exist Yet)

If you haven't run the database setup yet:

1. Run the updated `scripts/setup_database.sql` (already updated with first_name/last_name)
2. No migration needed!

## Verify Migration

After migration, verify the schema:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

You should see:
- `id` (uuid)
- `email` (text)
- `first_name` (text, NOT NULL)
- `last_name` (text, NOT NULL)
- `created_at` (timestamptz)

## Testing

After migration, test signup:

1. Start backend: `cd backend && source venv/bin/activate && flask run`
2. Try signing up from the frontend
3. Check Supabase Dashboard → Table Editor → users table
4. Verify `first_name` and `last_name` are populated correctly

