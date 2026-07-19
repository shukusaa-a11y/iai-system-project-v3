/*
# Create profiles and transactions tables for IAI System Project

1. Purpose
   - `profiles` stores each user's email and token balance (pay-as-you-go wallet).
   - `transactions` logs every token purchase and consumption event for audit/history.

2. New Tables
   - `profiles`
     - `id` (uuid, primary key, references auth.users)
     - `email` (text, unique, not null)
     - `tokens_balance` (numeric, default 0) — current token wallet
     - `created_at` (timestamptz, default now())
   - `transactions`
     - `id` (uuid, primary key, default gen_random_uuid())
     - `user_id` (uuid, not null, default auth.uid(), references auth.users)
     - `amount` (numeric, not null) — USD amount for purchases, 0 for consumption
     - `tokens` (integer, not null) — tokens added (positive) or consumed (negative)
     - `type` (text, not null) — 'purchase' | 'chat_input' | 'chat_output' | 'image' | 'search'
     - `created_at` (timestamptz, default now())

3. Security
   - RLS enabled on both tables.
   - profiles: owner-scoped CRUD (auth.uid() = id).
   - transactions: owner-scoped SELECT and INSERT (auth.uid() = user_id).
     UPDATE/DELETE disabled — transactions are append-only for audit integrity.

4. Notes
   - `profiles.id` mirrors `auth.users.id` (1:1). A trigger could auto-insert a row on
     signup, but the frontend will upsert on first login for simplicity.
   - `tokens_balance` uses numeric(12,2) to avoid floating-point drift.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  tokens_balance numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  tokens integer NOT NULL,
  type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_transactions" ON transactions;
CREATE POLICY "select_own_transactions" ON transactions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_transactions" ON transactions;
CREATE POLICY "insert_own_transactions" ON transactions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
