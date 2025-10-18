    -- Life OS MVP Database Schema
    -- Run this in your Supabase SQL editor

    -- Enable Row Level Security
    --ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

    -- Create users table
    CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create user_profiles table
    CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    goals JSONB DEFAULT '[]'::jsonb,
    constraints JSONB DEFAULT '[]'::jsonb,
    preferences JSONB DEFAULT '{}'::jsonb,
    routines JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
    );

    -- Create conversations table
    CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    messages JSONB NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
    CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
    CREATE INDEX IF NOT EXISTS idx_conversations_timestamp ON conversations(timestamp DESC);

    -- Enable Row Level Security
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

    -- Create RLS policies for users table
    CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

    CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

    -- Create RLS policies for user_profiles table
    CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid()::text = user_id::text);

    CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

    CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid()::text = user_id::text);

    -- Create RLS policies for conversations table
    CREATE POLICY "Users can view own conversations" ON conversations
    FOR SELECT USING (auth.uid()::text = user_id::text);

    CREATE POLICY "Users can insert own conversations" ON conversations
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

    -- Create function to update updated_at timestamp
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
    END;
    $$ language 'plpgsql';

    -- Create triggers to automatically update updated_at
    CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
