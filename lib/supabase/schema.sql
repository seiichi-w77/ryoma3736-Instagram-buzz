-- Instagram-buzz Database Schema
-- Version: 1.0.0
-- Created: 2025-11-25

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- USERS TABLE
-- =============================================================================
-- Stores user authentication and profile information
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,

  -- Instagram credentials (encrypted)
  instagram_username TEXT,
  instagram_session_id TEXT, -- Encrypted session token

  -- User preferences
  preferred_language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',

  -- Subscription & billing
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'pro', 'enterprise')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'canceled', 'expired', 'trial')),
  subscription_expires_at TIMESTAMPTZ,

  -- Usage tracking
  monthly_generation_count INTEGER DEFAULT 0,
  total_generation_count INTEGER DEFAULT 0,
  last_generation_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ, -- Soft delete support

  -- Indexes
  CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON users(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;

-- =============================================================================
-- REELS TABLE
-- =============================================================================
-- Stores fetched Instagram Reels metadata and analytics
CREATE TABLE IF NOT EXISTS reels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Instagram metadata
  instagram_reel_id TEXT UNIQUE NOT NULL,
  instagram_url TEXT NOT NULL,
  shortcode TEXT UNIQUE NOT NULL,

  -- Content information
  caption TEXT,
  thumbnail_url TEXT,
  video_url TEXT,
  duration_seconds INTEGER,

  -- Engagement metrics
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  play_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,

  -- Creator information
  creator_username TEXT,
  creator_full_name TEXT,
  creator_profile_pic_url TEXT,

  -- Content analysis (AI-generated)
  content_type TEXT, -- e.g., 'dance', 'comedy', 'tutorial', 'product-review'
  detected_topics TEXT[], -- Array of topics
  detected_objects TEXT[], -- Array of detected objects
  sentiment_score FLOAT, -- -1.0 to 1.0
  virality_score FLOAT, -- 0.0 to 100.0

  -- Status
  fetch_status TEXT DEFAULT 'pending' CHECK (fetch_status IN ('pending', 'fetched', 'failed', 'unavailable')),
  analysis_status TEXT DEFAULT 'pending' CHECK (analysis_status IN ('pending', 'analyzed', 'failed')),

  -- Metadata
  fetched_at TIMESTAMPTZ,
  analyzed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT reels_duration_check CHECK (duration_seconds > 0),
  CONSTRAINT reels_engagement_check CHECK (like_count >= 0 AND comment_count >= 0 AND play_count >= 0)
);

-- Create indexes for reels table
CREATE INDEX IF NOT EXISTS idx_reels_user_id ON reels(user_id);
CREATE INDEX IF NOT EXISTS idx_reels_instagram_reel_id ON reels(instagram_reel_id);
CREATE INDEX IF NOT EXISTS idx_reels_shortcode ON reels(shortcode);
CREATE INDEX IF NOT EXISTS idx_reels_creator_username ON reels(creator_username);
CREATE INDEX IF NOT EXISTS idx_reels_fetch_status ON reels(fetch_status);
CREATE INDEX IF NOT EXISTS idx_reels_virality_score ON reels(virality_score DESC);
CREATE INDEX IF NOT EXISTS idx_reels_created_at ON reels(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reels_detected_topics ON reels USING GIN(detected_topics);

-- =============================================================================
-- TEMPLATES TABLE
-- =============================================================================
-- Stores content generation templates
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL = system template

  -- Template information
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('caption', 'hashtags', 'script', 'title', 'description', 'custom')),

  -- Template content
  template_content TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb, -- Array of variable definitions: [{"name": "topic", "type": "string", "required": true}]

  -- Template settings
  tone TEXT, -- e.g., 'professional', 'casual', 'humorous', 'inspirational'
  target_audience TEXT, -- e.g., 'teens', 'adults', 'professionals'
  max_length INTEGER,
  include_emojis BOOLEAN DEFAULT false,
  include_hashtags BOOLEAN DEFAULT true,
  hashtag_count INTEGER DEFAULT 5,

  -- Usage tracking
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,

  -- Visibility
  is_public BOOLEAN DEFAULT false,
  is_system_template BOOLEAN DEFAULT false, -- System-provided templates

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT templates_name_check CHECK (length(name) >= 3),
  CONSTRAINT templates_hashtag_count_check CHECK (hashtag_count >= 0 AND hashtag_count <= 30)
);

-- Create indexes for templates table
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_is_public ON templates(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_templates_is_system ON templates(is_system_template) WHERE is_system_template = true;
CREATE INDEX IF NOT EXISTS idx_templates_usage_count ON templates(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_templates_created_at ON templates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_templates_deleted_at ON templates(deleted_at) WHERE deleted_at IS NULL;

-- =============================================================================
-- GENERATED_CONTENTS TABLE
-- =============================================================================
-- Stores AI-generated content based on Reels and Templates
CREATE TABLE IF NOT EXISTS generated_contents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reel_id UUID REFERENCES reels(id) ON DELETE SET NULL,
  template_id UUID REFERENCES templates(id) ON DELETE SET NULL,

  -- Content metadata
  content_type TEXT NOT NULL CHECK (content_type IN ('caption', 'hashtags', 'script', 'title', 'description', 'full-package')),

  -- Generated content
  generated_text TEXT NOT NULL,
  generated_hashtags TEXT[], -- Array of hashtags without #
  generated_metadata JSONB DEFAULT '{}'::jsonb, -- Additional metadata (emojis used, keywords, etc.)

  -- Generation parameters
  prompt_used TEXT,
  model_used TEXT DEFAULT 'claude-sonnet-4-5', -- AI model identifier
  temperature FLOAT DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 1000,

  -- Quality metrics
  quality_score FLOAT, -- 0.0 to 100.0
  readability_score FLOAT, -- 0.0 to 100.0
  engagement_prediction FLOAT, -- 0.0 to 100.0

  -- User interaction
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  user_feedback TEXT,
  is_favorite BOOLEAN DEFAULT false,
  is_used BOOLEAN DEFAULT false, -- Whether user actually used this content
  used_at TIMESTAMPTZ,

  -- Status
  generation_status TEXT DEFAULT 'completed' CHECK (generation_status IN ('pending', 'completed', 'failed', 'timeout')),
  error_message TEXT,

  -- Metadata
  generation_time_ms INTEGER, -- Time taken to generate in milliseconds
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT generated_contents_text_check CHECK (length(generated_text) > 0),
  CONSTRAINT generated_contents_quality_check CHECK (quality_score IS NULL OR (quality_score >= 0 AND quality_score <= 100))
);

-- Create indexes for generated_contents table
CREATE INDEX IF NOT EXISTS idx_generated_contents_user_id ON generated_contents(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_contents_reel_id ON generated_contents(reel_id);
CREATE INDEX IF NOT EXISTS idx_generated_contents_template_id ON generated_contents(template_id);
CREATE INDEX IF NOT EXISTS idx_generated_contents_content_type ON generated_contents(content_type);
CREATE INDEX IF NOT EXISTS idx_generated_contents_is_favorite ON generated_contents(is_favorite) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS idx_generated_contents_is_used ON generated_contents(is_used) WHERE is_used = true;
CREATE INDEX IF NOT EXISTS idx_generated_contents_quality_score ON generated_contents(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_generated_contents_created_at ON generated_contents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_contents_user_created ON generated_contents(user_id, created_at DESC);

-- =============================================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================================

-- Function: Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update users.updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update reels.updated_at
CREATE TRIGGER update_reels_updated_at
  BEFORE UPDATE ON reels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update templates.updated_at
CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update generated_contents.updated_at
CREATE TRIGGER update_generated_contents_updated_at
  BEFORE UPDATE ON generated_contents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function: Reset monthly generation count (call via cron)
CREATE OR REPLACE FUNCTION reset_monthly_generation_counts()
RETURNS void AS $$
BEGIN
  UPDATE users
  SET monthly_generation_count = 0
  WHERE monthly_generation_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Function: Increment template usage count
CREATE OR REPLACE FUNCTION increment_template_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.template_id IS NOT NULL THEN
    UPDATE templates
    SET
      usage_count = usage_count + 1,
      last_used_at = NOW()
    WHERE id = NEW.template_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Increment template usage on content generation
CREATE TRIGGER increment_template_usage_trigger
  AFTER INSERT ON generated_contents
  FOR EACH ROW
  EXECUTE FUNCTION increment_template_usage();

-- Function: Increment user generation count
CREATE OR REPLACE FUNCTION increment_user_generation_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET
    monthly_generation_count = monthly_generation_count + 1,
    total_generation_count = total_generation_count + 1,
    last_generation_at = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Increment user generation counts
CREATE TRIGGER increment_user_generation_count_trigger
  AFTER INSERT ON generated_contents
  FOR EACH ROW
  EXECUTE FUNCTION increment_user_generation_count();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_contents ENABLE ROW LEVEL SECURITY;

-- Users: Can only read/update their own data
CREATE POLICY users_select_own ON users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY users_update_own ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- Reels: Users can CRUD their own reels
CREATE POLICY reels_select_own ON reels
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY reels_insert_own ON reels
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY reels_update_own ON reels
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY reels_delete_own ON reels
  FOR DELETE
  USING (auth.uid() = user_id);

-- Templates: Users can see public templates and their own templates
CREATE POLICY templates_select_public_or_own ON templates
  FOR SELECT
  USING (is_public = true OR is_system_template = true OR auth.uid() = user_id);

CREATE POLICY templates_insert_own ON templates
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY templates_update_own ON templates
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY templates_delete_own ON templates
  FOR DELETE
  USING (auth.uid() = user_id);

-- Generated Contents: Users can CRUD their own generated content
CREATE POLICY generated_contents_select_own ON generated_contents
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY generated_contents_insert_own ON generated_contents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY generated_contents_update_own ON generated_contents
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY generated_contents_delete_own ON generated_contents
  FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- INITIAL DATA (SYSTEM TEMPLATES)
-- =============================================================================

-- Insert system templates for common use cases
INSERT INTO templates (user_id, name, description, category, template_content, tone, is_public, is_system_template, variables) VALUES
(
  NULL,
  'Engaging Caption with CTA',
  'A versatile caption template with call-to-action',
  'caption',
  'Check out this amazing {topic}! {description}\n\nWhat do you think? Drop a comment below! 👇\n\n{hashtags}',
  'casual',
  true,
  true,
  '[{"name": "topic", "type": "string", "required": true}, {"name": "description", "type": "string", "required": true}, {"name": "hashtags", "type": "string", "required": false}]'::jsonb
),
(
  NULL,
  'Professional Tutorial Script',
  'Script template for educational/tutorial content',
  'script',
  'Hook: {hook}\n\nIntro: Hey everyone! Today I''m showing you how to {topic}.\n\nMain Content:\n{main_points}\n\nConclusion: {conclusion}\n\nCTA: If you found this helpful, don''t forget to save and share!',
  'professional',
  true,
  true,
  '[{"name": "hook", "type": "string", "required": true}, {"name": "topic", "type": "string", "required": true}, {"name": "main_points", "type": "string", "required": true}, {"name": "conclusion", "type": "string", "required": true}]'::jsonb
),
(
  NULL,
  'Viral Hashtag Generator',
  'Generates trending hashtags for maximum reach',
  'hashtags',
  'Generate 15-20 relevant hashtags combining:\n- 3-5 niche-specific tags\n- 5-7 medium-popularity tags (10k-500k posts)\n- 5-7 high-popularity tags (500k+ posts)\n- 2-3 trending tags\n\nTopic: {topic}\nNiche: {niche}',
  'neutral',
  true,
  true,
  '[{"name": "topic", "type": "string", "required": true}, {"name": "niche", "type": "string", "required": true}]'::jsonb
);

-- =============================================================================
-- COMMENTS & DOCUMENTATION
-- =============================================================================

COMMENT ON TABLE users IS 'Stores user authentication and profile information';
COMMENT ON TABLE reels IS 'Stores fetched Instagram Reels metadata and analytics';
COMMENT ON TABLE templates IS 'Stores content generation templates';
COMMENT ON TABLE generated_contents IS 'Stores AI-generated content based on Reels and Templates';

COMMENT ON COLUMN users.subscription_tier IS 'User subscription level: free, basic, pro, enterprise';
COMMENT ON COLUMN reels.virality_score IS 'AI-calculated virality potential score (0-100)';
COMMENT ON COLUMN templates.variables IS 'JSON array defining template variables and their constraints';
COMMENT ON COLUMN generated_contents.engagement_prediction IS 'AI-predicted engagement score (0-100)';
