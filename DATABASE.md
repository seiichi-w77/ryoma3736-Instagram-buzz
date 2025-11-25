# Instagram-buzz Database Schema & Client Documentation

## Overview

Instagram-buzz uses **Supabase** (PostgreSQL) for data persistence. The database is designed to support Instagram content analysis, AI-powered content generation, and user subscription management.

**Current Version**: 1.0.0
**Last Updated**: 2025-11-25

## Quick Start

### Environment Setup

Add these variables to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Installation

```bash
# Install Supabase client
npm install @supabase/supabase-js

# TypeScript types are auto-generated
npm run typecheck
```

### Basic Usage

```typescript
import {
  getUser,
  createReel,
  listGeneratedContents,
  markAsFavorite,
} from '@/lib/supabase/client';

// Get user with stats
const result = await getUser('user-id');
if (result.error) {
  console.error(result.error.message);
} else {
  console.log(result.data); // User object
}

// Create a new reel
const reel = await createReel({
  user_id: 'user-id',
  instagram_reel_id: 'reel-12345',
  instagram_url: 'https://...',
  shortcode: 'ABC123',
  caption: 'Amazing content',
  like_count: 1500,
  comment_count: 45,
  play_count: 5000,
  share_count: 120,
});

// List generated contents with pagination
const contents = await listGeneratedContents({
  user_id: 'user-id',
  limit: 20,
  offset: 0,
  is_favorite: true,
});

console.log(contents.pagination); // Page info
console.log(contents.data); // Content array
```

## Database Schema

### Tables

#### 1. **users** - User Accounts & Profile

Stores authentication and subscription information.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,

  -- Instagram integration
  instagram_username TEXT,
  instagram_session_id TEXT,

  -- Preferences
  preferred_language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',

  -- Subscription
  subscription_tier TEXT DEFAULT 'free',  -- free|basic|pro|enterprise
  subscription_status TEXT DEFAULT 'active', -- active|canceled|expired|trial
  subscription_expires_at TIMESTAMPTZ,

  -- Usage metrics
  monthly_generation_count INTEGER DEFAULT 0,
  total_generation_count INTEGER DEFAULT 0,
  last_generation_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ -- Soft delete
);
```

**Key Indexes**:
- `email`, `username`, `subscription_tier`
- `created_at DESC` for recent user queries

**Constraints**:
- Email format validation (RFC 5322 basic)
- Unique email and username

---

#### 2. **reels** - Instagram Content

Stores fetched Instagram Reels with metadata and AI analysis.

```sql
CREATE TABLE reels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Instagram metadata
  instagram_reel_id TEXT UNIQUE NOT NULL,
  instagram_url TEXT NOT NULL,
  shortcode TEXT UNIQUE NOT NULL,

  -- Content
  caption TEXT,
  thumbnail_url TEXT,
  video_url TEXT,
  duration_seconds INTEGER,

  -- Engagement metrics
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  play_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,

  -- Creator info
  creator_username TEXT,
  creator_full_name TEXT,
  creator_profile_pic_url TEXT,

  -- AI Analysis
  content_type TEXT, -- dance, comedy, tutorial, etc.
  detected_topics TEXT[], -- Array
  detected_objects TEXT[], -- Array
  sentiment_score FLOAT, -- -1.0 to 1.0
  virality_score FLOAT, -- 0.0 to 100.0

  -- Status
  fetch_status TEXT DEFAULT 'pending', -- pending|fetched|failed|unavailable
  analysis_status TEXT DEFAULT 'pending', -- pending|analyzed|failed

  -- Timestamps
  fetched_at TIMESTAMPTZ,
  analyzed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Indexes**:
- `user_id` (fast user queries)
- `instagram_reel_id`, `shortcode` (unique lookups)
- `virality_score DESC` (ranking)
- `detected_topics` using GIN (for array searches)
- `created_at DESC` (timeline queries)

**Analysis Flow**:
1. `fetch_status: pending` → Reel created
2. `fetch_status: fetched` → Metadata retrieved
3. `analysis_status: pending` → Queued for AI analysis
4. `analysis_status: analyzed` → AI metrics populated

---

#### 3. **templates** - Content Generation Templates

System and user-created templates for AI content generation.

```sql
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL = system template

  -- Metadata
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- caption|hashtags|script|title|description|custom

  -- Template definition
  template_content TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb, -- [{name, type, required, default}]

  -- Settings
  tone TEXT, -- professional|casual|humorous|inspirational|neutral
  target_audience TEXT, -- teens|adults|professionals|general
  max_length INTEGER,
  include_emojis BOOLEAN DEFAULT false,
  include_hashtags BOOLEAN DEFAULT true,
  hashtag_count INTEGER DEFAULT 5,

  -- Usage tracking
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,

  -- Visibility
  is_public BOOLEAN DEFAULT false,
  is_system_template BOOLEAN DEFAULT false,

  -- Soft delete
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
```

**Key Indexes**:
- `user_id` (user's templates)
- `category`, `tone` (filtering)
- `is_public` (public library)
- `is_system_template` (system templates)
- `usage_count DESC` (popular templates)

**Template Variables Example**:
```json
[
  {
    "name": "topic",
    "type": "string",
    "required": true,
    "description": "Main topic of the content"
  },
  {
    "name": "hashtag_count",
    "type": "number",
    "required": false,
    "default": 10
  }
]
```

**System Templates**:
- "Engaging Caption with CTA" - caption category
- "Professional Tutorial Script" - script category
- "Viral Hashtag Generator" - hashtags category

---

#### 4. **generated_contents** - AI-Generated Content

Stores AI-generated content with quality metrics and user feedback.

```sql
CREATE TABLE generated_contents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reel_id UUID REFERENCES reels(id) ON DELETE SET NULL,
  template_id UUID REFERENCES templates(id) ON DELETE SET NULL,

  -- Content metadata
  content_type TEXT NOT NULL, -- caption|hashtags|script|title|description|full-package

  -- Generated content
  generated_text TEXT NOT NULL,
  generated_hashtags TEXT[], -- Array
  generated_metadata JSONB DEFAULT '{}'::jsonb, -- {emojis_used, keywords, word_count, etc.}

  -- Generation parameters
  prompt_used TEXT,
  model_used TEXT DEFAULT 'claude-sonnet-4-5',
  temperature FLOAT DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 1000,

  -- Quality metrics
  quality_score FLOAT, -- 0.0 to 100.0
  readability_score FLOAT, -- 0.0 to 100.0
  engagement_prediction FLOAT, -- 0.0 to 100.0

  -- User interaction
  user_rating INTEGER, -- 1 to 5
  user_feedback TEXT,
  is_favorite BOOLEAN DEFAULT false,
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ,

  -- Status
  generation_status TEXT DEFAULT 'completed', -- pending|completed|failed|timeout
  error_message TEXT,

  -- Performance
  generation_time_ms INTEGER,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Indexes**:
- `user_id` (user's content)
- `reel_id`, `template_id` (relation queries)
- `content_type` (filtering)
- `is_favorite`, `is_used` (conditional queries)
- `quality_score DESC` (quality ranking)
- `user_id, created_at DESC` (timeline)

**Generation Metadata Example**:
```json
{
  "emojis_used": ["👍", "🎉", "✨"],
  "keywords": ["instagram", "content", "viral"],
  "word_count": 145,
  "character_count": 892,
  "hashtag_positions": [12, 45, 78],
  "language_detected": "en"
}
```

---

## API Client Reference

### Response Types

All database operations return typed responses:

```typescript
interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  status: number; // 200, 201, 400, 500, etc.
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    page_size: number;
    total_count: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
  error: ApiError | null;
}
```

### Users Operations

#### Get User

```typescript
const result = await getUser(userId: string);
// Returns: ApiResponse<User>
```

#### Get User by Email

```typescript
const result = await getUserByEmail(email: string);
// Returns: ApiResponse<User>
```

#### Create User

```typescript
const result = await createUser({
  email: 'user@example.com',
  preferred_language: 'en',
  timezone: 'UTC',
  // ... other fields
});
// Returns: ApiResponse<User>
```

#### Update User

```typescript
const result = await updateUser(userId, {
  display_name: 'New Name',
  monthly_generation_count: 42,
  // ... partial updates
});
// Returns: ApiResponse<User>
```

#### Get User with Stats

```typescript
const result = await getUserWithStats(userId);
// Returns: ApiResponse<UserWithStats>
// Includes: total_reels_count, total_templates_count, favorite_contents_count, average_content_rating
```

### Reels Operations

#### Get Reel

```typescript
const result = await getReel(reelId: string);
// Returns: ApiResponse<Reel>
```

#### Get Reel with User Info

```typescript
const result = await getReelWithUser(reelId: string);
// Returns: ApiResponse<ReelWithUser>
```

#### List Reels

```typescript
const result = await listReels({
  user_id?: string;
  creator_username?: string;
  content_type?: string;
  min_virality_score?: number;
  fetch_status?: 'pending' | 'fetched' | 'failed' | 'unavailable';
  analysis_status?: 'pending' | 'analyzed' | 'failed';
  created_after?: string; // ISO 8601
  created_before?: string; // ISO 8601
  limit?: number; // default: 20
  offset?: number; // default: 0
  order_by?: string; // default: 'created_at'
  order_direction?: 'asc' | 'desc'; // default: 'desc'
});
// Returns: PaginatedResponse<Reel>
```

#### Create Reel

```typescript
const result = await createReel({
  user_id: string;
  instagram_reel_id: string;
  instagram_url: string;
  shortcode: string;
  caption?: string;
  like_count?: number;
  comment_count?: number;
  // ... other fields
});
// Returns: ApiResponse<Reel>
```

#### Update Reel

```typescript
const result = await updateReel(reelId, {
  virality_score: 85.5,
  analysis_status: 'analyzed',
  detected_topics: ['dance', 'trending'],
  // ... partial updates
});
// Returns: ApiResponse<Reel>
```

#### Delete Reel

```typescript
const result = await deleteReel(reelId: string);
// Returns: ApiResponse<null>
```

### Templates Operations

#### Get Template

```typescript
const result = await getTemplate(templateId: string);
// Returns: ApiResponse<Template>
```

#### List Templates

```typescript
const result = await listTemplates({
  user_id?: string;
  category?: 'caption' | 'hashtags' | 'script' | 'title' | 'description' | 'custom';
  tone?: 'professional' | 'casual' | 'humorous' | 'inspirational' | 'neutral';
  is_public?: boolean;
  is_system_template?: boolean;
  search_query?: string;
  limit?: number;
  offset?: number;
});
// Returns: PaginatedResponse<Template>
```

#### Get Template with Stats

```typescript
const result = await getTemplateWithStats(templateId: string);
// Returns: ApiResponse<TemplateWithStats>
// Includes: recent_generations_count, average_quality_score, average_user_rating
```

#### Create Template

```typescript
const result = await createTemplate({
  user_id: string; // null for system templates
  name: string;
  description?: string;
  category: string;
  template_content: string;
  variables?: TemplateVariable[];
  tone?: string;
  target_audience?: string;
  include_emojis?: boolean;
  include_hashtags?: boolean;
  // ... other fields
});
// Returns: ApiResponse<Template>
```

#### Update Template

```typescript
const result = await updateTemplate(templateId, {
  name: 'Updated Template',
  is_public: true,
  // ... partial updates
});
// Returns: ApiResponse<Template>
```

#### Delete Template

```typescript
const result = await deleteTemplate(templateId: string);
// Performs soft delete (sets deleted_at timestamp)
// Returns: ApiResponse<null>
```

### Generated Contents Operations

#### Get Generated Content

```typescript
const result = await getGeneratedContent(contentId: string);
// Returns: ApiResponse<GeneratedContent>
```

#### Get with Relations

```typescript
const result = await getGeneratedContentWithRelations(contentId: string);
// Returns: ApiResponse<GeneratedContentWithRelations>
// Includes: user, reel, template objects
```

#### List Generated Contents

```typescript
const result = await listGeneratedContents({
  user_id?: string;
  reel_id?: string;
  template_id?: string;
  content_type?: 'caption' | 'hashtags' | 'script' | 'title' | 'description' | 'full-package';
  is_favorite?: boolean;
  is_used?: boolean;
  min_quality_score?: number;
  generation_status?: 'pending' | 'completed' | 'failed' | 'timeout';
  created_after?: string;
  created_before?: string;
  limit?: number;
  offset?: number;
});
// Returns: PaginatedResponse<GeneratedContent>
```

#### Create Generated Content

```typescript
const result = await createGeneratedContent({
  user_id: string;
  reel_id?: string;
  template_id?: string;
  content_type: string;
  generated_text: string;
  generated_hashtags?: string[];
  generated_metadata?: Record<string, any>;
  prompt_used?: string;
  model_used?: string;
  temperature?: number;
  max_tokens?: number;
  quality_score?: number;
  readability_score?: number;
  engagement_prediction?: number;
});
// Returns: ApiResponse<GeneratedContent>
```

#### Update Generated Content

```typescript
const result = await updateGeneratedContent(contentId, {
  quality_score: 87.5,
  is_favorite: true,
  // ... partial updates
});
// Returns: ApiResponse<GeneratedContent>
```

#### Mark as Favorite

```typescript
const result = await markAsFavorite(contentId: string);
// Returns: ApiResponse<GeneratedContent>
```

#### Mark as Used

```typescript
const result = await markAsUsed(contentId: string);
// Sets is_used to true and used_at timestamp
// Returns: ApiResponse<GeneratedContent>
```

#### Rate Generated Content

```typescript
const result = await rateGeneratedContent(
  contentId: string,
  rating: number, // 1-5
  feedback?: string
);
// Returns: ApiResponse<GeneratedContent>
```

#### Delete Generated Content

```typescript
const result = await deleteGeneratedContent(contentId: string);
// Returns: ApiResponse<null>
```

### Analytics Operations

#### Get User Generation Metrics

```typescript
const result = await getUserGenerationMetrics(userId: string);
// Returns: ApiResponse<{
//   monthly_generations: number;
//   total_generations: number;
//   last_generation_at: string | null;
// }>
```

#### Get Average Quality Metrics

```typescript
const result = await getAverageQualityMetrics(userId: string);
// Returns: ApiResponse<{
//   average_quality_score: number;
//   average_readability_score: number;
//   average_engagement_prediction: number;
// }>
```

---

## Subscription Tiers & Limits

```typescript
const SUBSCRIPTION_LIMITS = {
  free: {
    monthly_generations: 50,
    max_templates: 5,
    max_reels_stored: 20,
    api_rate_limit: 10,
    features: {
      custom_templates: false,
      advanced_analytics: false,
      priority_support: false,
      api_access: false,
    },
  },
  basic: {
    monthly_generations: 200,
    max_templates: 20,
    max_reels_stored: 100,
    api_rate_limit: 30,
    features: { /* ... */ },
  },
  pro: {
    monthly_generations: 1000,
    max_templates: 100,
    max_reels_stored: 500,
    api_rate_limit: 100,
    features: { /* ... */ },
  },
  enterprise: {
    monthly_generations: -1, // unlimited
    max_templates: -1, // unlimited
    max_reels_stored: -1, // unlimited
    api_rate_limit: 1000,
    features: { /* ... */ },
  },
};
```

### Helper Functions

```typescript
// Check if user reached monthly generation limit
if (hasReachedGenerationLimit(user)) {
  // Show upgrade prompt
}

// Check if subscription is active
if (!isSubscriptionActive(user)) {
  // Redirect to subscription page
}

// Check if user can create custom templates
if (canCreateCustomTemplates(user)) {
  // Show template creation UI
}
```

---

## Row Level Security (RLS)

All tables have RLS enabled for multi-tenant isolation:

- **Users**: Can only read/update their own profile
- **Reels**: Users can CRUD their own reels
- **Templates**: Users can see public/system templates and their own; can CRUD own
- **Generated Contents**: Users can CRUD only their own content

RLS policies automatically enforce `auth.uid() = user_id` checks.

---

## Triggers & Automatic Updates

### 1. Automatic Timestamp Updates

```sql
-- All tables update `updated_at` automatically on modification
UPDATE users SET display_name = '...' -- updated_at auto-set
```

### 2. Template Usage Tracking

```sql
-- When content is generated with a template, increment usage count
INSERT INTO generated_contents (template_id, ...) VALUES (...)
-- → triggers UPDATE templates SET usage_count = usage_count + 1
```

### 3. User Generation Count

```sql
-- When content is generated, increment user counters
INSERT INTO generated_contents (user_id, ...) VALUES (...)
-- → triggers UPDATE users SET
--     monthly_generation_count = monthly_generation_count + 1,
--     total_generation_count = total_generation_count + 1,
--     last_generation_at = NOW()
```

### 4. Monthly Reset (Manual)

```sql
-- Call monthly via scheduled job (Supabase cron)
SELECT reset_monthly_generation_counts();
-- Resets all monthly_generation_count to 0
```

---

## Performance Optimization Tips

### 1. Use Pagination

```typescript
// BAD: Loads all records
const { data } = await listReels({ user_id });

// GOOD: Paginate with limits
const { data, pagination } = await listReels({
  user_id,
  limit: 20,
  offset: 0,
});

// Iterate pages
for (let page = 1; page <= pagination.total_pages; page++) {
  const offset = (page - 1) * 20;
  // fetch next page
}
```

### 2. Filter Early

```typescript
// BAD: Fetch all then filter
const allReels = await listReels({ user_id });
const viralReels = allReels.data.filter(r => r.virality_score > 80);

// GOOD: Filter in query
const viralReels = await listReels({
  user_id,
  min_virality_score: 80,
});
```

### 3. Select Specific Fields

```typescript
// Currently client.ts fetches all fields
// For better performance, customize queries in specific use cases
```

### 4. Cache Results

```typescript
// Cache user stats (updated less frequently)
const cachedStats = new Map();

async function getOrCacheUserStats(userId) {
  if (cachedStats.has(userId)) {
    return cachedStats.get(userId);
  }
  const result = await getUserWithStats(userId);
  if (result.data) {
    cachedStats.set(userId, result.data);
  }
  return result;
}
```

---

## Common Workflows

### Workflow 1: Fetch Reel & Generate Content

```typescript
// 1. Get reel
const reelResult = await getReel(reelId);
if (reelResult.error) throw reelResult.error;

const reel = reelResult.data!;

// 2. Get template
const templateResult = await getTemplate(templateId);
if (templateResult.error) throw templateResult.error;

// 3. Generate content (using Claude API)
const generatedText = await generateWithClaude(
  reel,
  templateResult.data!
);

// 4. Save generated content
const contentResult = await createGeneratedContent({
  user_id: userId,
  reel_id: reelId,
  template_id: templateId,
  content_type: 'caption',
  generated_text: generatedText,
  model_used: 'claude-sonnet-4-5',
  quality_score: 85.5,
  generation_status: 'completed',
});

if (contentResult.error) throw contentResult.error;
return contentResult.data!;
```

### Workflow 2: Get User's Favorite Content

```typescript
const result = await listGeneratedContents({
  user_id: userId,
  is_favorite: true,
  limit: 50,
  order_by: 'created_at',
  order_direction: 'desc',
});

// Group by type
const byType = result.data.reduce((acc, content) => {
  if (!acc[content.content_type]) {
    acc[content.content_type] = [];
  }
  acc[content.content_type].push(content);
  return acc;
}, {} as Record<string, GeneratedContent[]>);
```

### Workflow 3: Check Generation Quota

```typescript
const userResult = await getUser(userId);
if (userResult.error) throw userResult.error;

const user = userResult.data!;
const limits = SUBSCRIPTION_LIMITS[user.subscription_tier];

const canGenerate = !hasReachedGenerationLimit(user);
const remaining = limits.monthly_generations - user.monthly_generation_count;

console.log(`
  Tier: ${user.subscription_tier}
  Monthly limit: ${limits.monthly_generations}
  Used: ${user.monthly_generation_count}
  Remaining: ${remaining}
  Can generate: ${canGenerate}
`);
```

---

## File Structure

```
lib/supabase/
├── schema.sql          # SQL table definitions & migrations
├── types.ts            # TypeScript type definitions & helpers
├── client.ts           # Database client with operations
└── README              # (This file)
```

---

## Troubleshooting

### "Cannot find module '@supabase/supabase-js'"

```bash
npm install @supabase/supabase-js
```

### "Missing environment variables"

```bash
# Add to .env.local
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

### "RLS policy denied"

- Ensure user is authenticated
- Check that `auth.uid()` matches the `user_id` in the row
- Verify RLS policies are correctly set in Supabase dashboard

### "Subscription limits not working"

- Call `reset_monthly_generation_counts()` monthly
- Ensure `subscription_tier` is correctly set on user creation

---

## Next Steps

1. **Deploy Schema**: Run `schema.sql` in Supabase SQL editor
2. **Enable RLS**: Verify RLS policies are created
3. **Set up Auth**: Configure Supabase authentication
4. **Seed Data**: Insert system templates
5. **Test**: Run database operations

---

## References

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Instagram API Docs](https://developers.facebook.com/docs/instagram-api)

---

**Version**: 1.0.0
**Author**: Instagram-buzz Team
**License**: MIT
