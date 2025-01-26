/*
  # Initial Schema Setup for AI Matchmaking System

  1. New Tables
    - `users`
      - Core user information and personality data
    - `matches`
      - Stores match results and compatibility scores
    - `interactions`
      - Tracks user interactions and feedback
    - `conversation_starters`
      - Stores generated conversation topics

  2. Security
    - RLS enabled on all tables
    - Policies for user data protection
    - Secure access patterns for matching data
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  auth_id uuid REFERENCES auth.users,
  age int NOT NULL,
  location jsonb NOT NULL,
  deal_breakers text[] DEFAULT '{}',
  interests text[] DEFAULT '{}',
  personality_profile jsonb NOT NULL,
  social_media_data jsonb,
  voice_analysis jsonb,
  last_active timestamptz DEFAULT now()
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at timestamptz DEFAULT now(),
  user1_id uuid REFERENCES users(id),
  user2_id uuid REFERENCES users(id),
  compatibility_score float NOT NULL,
  unique_connections text[] DEFAULT '{}',
  risk_analysis jsonb NOT NULL,
  status text DEFAULT 'pending'
);

-- Interactions table
CREATE TABLE IF NOT EXISTS interactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at timestamptz DEFAULT now(),
  match_id uuid REFERENCES matches(id),
  user_id uuid REFERENCES users(id),
  interaction_type text NOT NULL,
  feedback_score int,
  feedback_text text
);

-- Conversation starters table
CREATE TABLE IF NOT EXISTS conversation_starters (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at timestamptz DEFAULT now(),
  match_id uuid REFERENCES matches(id),
  topic text NOT NULL,
  context jsonb,
  used_at timestamptz
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_starters ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth_id = auth.uid());

-- Users can update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth_id = auth.uid());

-- Matches are visible to involved users
CREATE POLICY "Users can view their matches"
  ON matches
  FOR SELECT
  TO authenticated
  USING (
    user1_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    ) OR 
    user2_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

-- Users can only interact with their own matches
CREATE POLICY "Users can create interactions for their matches"
  ON interactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

-- Users can view conversation starters for their matches
CREATE POLICY "Users can view their conversation starters"
  ON conversation_starters
  FOR SELECT
  TO authenticated
  USING (
    match_id IN (
      SELECT id FROM matches 
      WHERE user1_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
      OR user2_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

-- Create indexes for performance
CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_matches_users ON matches(user1_id, user2_id);
CREATE INDEX idx_interactions_match ON interactions(match_id);
CREATE INDEX idx_conversation_starters_match ON conversation_starters(match_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();