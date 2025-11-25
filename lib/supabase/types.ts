/**
 * Instagram-buzz Database Types
 * Auto-generated from Supabase schema
 * Version: 1.0.0
 */

// =============================================================================
// ENUMS
// =============================================================================

export type SubscriptionTier = 'free' | 'basic' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'canceled' | 'expired' | 'trial';
export type FetchStatus = 'pending' | 'fetched' | 'failed' | 'unavailable';
export type AnalysisStatus = 'pending' | 'analyzed' | 'failed';
export type TemplateCategory = 'caption' | 'hashtags' | 'script' | 'title' | 'description' | 'custom';
export type ContentType = 'caption' | 'hashtags' | 'script' | 'title' | 'description' | 'full-package';
export type GenerationStatus = 'pending' | 'completed' | 'failed' | 'timeout';
export type TemplateTone = 'professional' | 'casual' | 'humorous' | 'inspirational' | 'neutral';
export type TargetAudience = 'teens' | 'adults' | 'professionals' | 'general';

// =============================================================================
// DATABASE TABLES
// =============================================================================

/**
 * Users Table
 * Stores user authentication and profile information
 */
export interface User {
  id: string; // UUID
  email: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;

  // Instagram credentials (encrypted)
  instagram_username: string | null;
  instagram_session_id: string | null;

  // User preferences
  preferred_language: string;
  timezone: string;

  // Subscription & billing
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
  subscription_expires_at: string | null; // ISO 8601 timestamp

  // Usage tracking
  monthly_generation_count: number;
  total_generation_count: number;
  last_generation_at: string | null; // ISO 8601 timestamp

  // Metadata
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
  last_login_at: string | null; // ISO 8601 timestamp
  deleted_at: string | null; // ISO 8601 timestamp
}

/**
 * Reels Table
 * Stores fetched Instagram Reels metadata and analytics
 */
export interface Reel {
  id: string; // UUID
  user_id: string; // UUID - Foreign key to users

  // Instagram metadata
  instagram_reel_id: string;
  instagram_url: string;
  shortcode: string;

  // Content information
  caption: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  duration_seconds: number | null;

  // Engagement metrics
  like_count: number;
  comment_count: number;
  play_count: number;
  share_count: number;

  // Creator information
  creator_username: string | null;
  creator_full_name: string | null;
  creator_profile_pic_url: string | null;

  // Content analysis (AI-generated)
  content_type: string | null;
  detected_topics: string[] | null;
  detected_objects: string[] | null;
  sentiment_score: number | null; // -1.0 to 1.0
  virality_score: number | null; // 0.0 to 100.0

  // Status
  fetch_status: FetchStatus;
  analysis_status: AnalysisStatus;

  // Metadata
  fetched_at: string | null; // ISO 8601 timestamp
  analyzed_at: string | null; // ISO 8601 timestamp
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

/**
 * Template Variable Definition
 */
export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  required: boolean;
  default?: string | number | boolean;
  description?: string;
}

/**
 * Templates Table
 * Stores content generation templates
 */
export interface Template {
  id: string; // UUID
  user_id: string | null; // UUID - Foreign key to users (NULL = system template)

  // Template information
  name: string;
  description: string | null;
  category: TemplateCategory;

  // Template content
  template_content: string;
  variables: TemplateVariable[]; // JSONB

  // Template settings
  tone: TemplateTone | null;
  target_audience: TargetAudience | null;
  max_length: number | null;
  include_emojis: boolean;
  include_hashtags: boolean;
  hashtag_count: number;

  // Usage tracking
  usage_count: number;
  last_used_at: string | null; // ISO 8601 timestamp

  // Visibility
  is_public: boolean;
  is_system_template: boolean;

  // Metadata
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
  deleted_at: string | null; // ISO 8601 timestamp
}

/**
 * Generated Content Metadata
 */
export interface GeneratedMetadata {
  emojis_used?: string[];
  keywords?: string[];
  word_count?: number;
  character_count?: number;
  hashtag_positions?: number[];
  language_detected?: string;
  [key: string]: unknown; // Allow additional properties
}

/**
 * Generated Contents Table
 * Stores AI-generated content based on Reels and Templates
 */
export interface GeneratedContent {
  id: string; // UUID
  user_id: string; // UUID - Foreign key to users
  reel_id: string | null; // UUID - Foreign key to reels
  template_id: string | null; // UUID - Foreign key to templates

  // Content metadata
  content_type: ContentType;

  // Generated content
  generated_text: string;
  generated_hashtags: string[] | null;
  generated_metadata: GeneratedMetadata; // JSONB

  // Generation parameters
  prompt_used: string | null;
  model_used: string;
  temperature: number;
  max_tokens: number;

  // Quality metrics
  quality_score: number | null; // 0.0 to 100.0
  readability_score: number | null; // 0.0 to 100.0
  engagement_prediction: number | null; // 0.0 to 100.0

  // User interaction
  user_rating: number | null; // 1 to 5
  user_feedback: string | null;
  is_favorite: boolean;
  is_used: boolean;
  used_at: string | null; // ISO 8601 timestamp

  // Status
  generation_status: GenerationStatus;
  error_message: string | null;

  // Metadata
  generation_time_ms: number | null;
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

// =============================================================================
// INSERT/UPDATE TYPES (Partial types for mutations)
// =============================================================================

/**
 * User Insert/Update Type
 */
export type UserInsert = Omit<User, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
};

export type UserUpdate = Partial<UserInsert>;

/**
 * Reel Insert/Update Type
 */
export type ReelInsert = Omit<Reel, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
};

export type ReelUpdate = Partial<ReelInsert>;

/**
 * Template Insert/Update Type
 */
export type TemplateInsert = Omit<Template, 'id' | 'created_at' | 'updated_at' | 'usage_count' | 'last_used_at'> & {
  id?: string;
};

export type TemplateUpdate = Partial<TemplateInsert>;

/**
 * Generated Content Insert/Update Type
 */
export type GeneratedContentInsert = Omit<GeneratedContent, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
};

export type GeneratedContentUpdate = Partial<GeneratedContentInsert>;

// =============================================================================
// QUERY RESULT TYPES (with relations)
// =============================================================================

/**
 * Reel with User relation
 */
export interface ReelWithUser extends Reel {
  user: User;
}

/**
 * Generated Content with all relations
 */
export interface GeneratedContentWithRelations extends GeneratedContent {
  user: User;
  reel: Reel | null;
  template: Template | null;
}

/**
 * Template with usage statistics
 */
export interface TemplateWithStats extends Template {
  recent_generations_count?: number;
  average_quality_score?: number;
  average_user_rating?: number;
}

/**
 * User with statistics
 */
export interface UserWithStats extends User {
  total_reels_count?: number;
  total_templates_count?: number;
  favorite_contents_count?: number;
  average_content_rating?: number;
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

/**
 * Generic API Response
 */
export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  status: number;
}

/**
 * API Error
 */
export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

/**
 * Paginated Response
 */
export interface PaginatedResponse<T> {
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

// =============================================================================
// FILTER & QUERY TYPES
// =============================================================================

/**
 * Common filter options
 */
export interface FilterOptions {
  limit?: number;
  offset?: number;
  order_by?: string;
  order_direction?: 'asc' | 'desc';
}

/**
 * Reel filter options
 */
export interface ReelFilterOptions extends FilterOptions {
  user_id?: string;
  creator_username?: string;
  content_type?: string;
  min_virality_score?: number;
  fetch_status?: FetchStatus;
  analysis_status?: AnalysisStatus;
  created_after?: string;
  created_before?: string;
}

/**
 * Template filter options
 */
export interface TemplateFilterOptions extends FilterOptions {
  user_id?: string;
  category?: TemplateCategory;
  tone?: TemplateTone;
  is_public?: boolean;
  is_system_template?: boolean;
  search_query?: string;
}

/**
 * Generated Content filter options
 */
export interface GeneratedContentFilterOptions extends FilterOptions {
  user_id?: string;
  reel_id?: string;
  template_id?: string;
  content_type?: ContentType;
  is_favorite?: boolean;
  is_used?: boolean;
  min_quality_score?: number;
  generation_status?: GenerationStatus;
  created_after?: string;
  created_before?: string;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Subscription limits based on tier
 */
export interface SubscriptionLimits {
  monthly_generations: number;
  max_templates: number;
  max_reels_stored: number;
  api_rate_limit: number; // requests per minute
  features: {
    custom_templates: boolean;
    advanced_analytics: boolean;
    priority_support: boolean;
    api_access: boolean;
  };
}

/**
 * Subscription limits mapping
 */
export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
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
    features: {
      custom_templates: true,
      advanced_analytics: false,
      priority_support: false,
      api_access: false,
    },
  },
  pro: {
    monthly_generations: 1000,
    max_templates: 100,
    max_reels_stored: 500,
    api_rate_limit: 100,
    features: {
      custom_templates: true,
      advanced_analytics: true,
      priority_support: true,
      api_access: true,
    },
  },
  enterprise: {
    monthly_generations: -1, // unlimited
    max_templates: -1, // unlimited
    max_reels_stored: -1, // unlimited
    api_rate_limit: 1000,
    features: {
      custom_templates: true,
      advanced_analytics: true,
      priority_support: true,
      api_access: true,
    },
  },
};

/**
 * Database table names
 */
export const TABLE_NAMES = {
  USERS: 'users',
  REELS: 'reels',
  TEMPLATES: 'templates',
  GENERATED_CONTENTS: 'generated_contents',
} as const;

/**
 * Type guard: Check if user has reached generation limit
 */
export function hasReachedGenerationLimit(user: User): boolean {
  const limits = SUBSCRIPTION_LIMITS[user.subscription_tier];
  if (limits.monthly_generations === -1) return false; // unlimited
  return user.monthly_generation_count >= limits.monthly_generations;
}

/**
 * Type guard: Check if subscription is active
 */
export function isSubscriptionActive(user: User): boolean {
  if (user.subscription_status !== 'active' && user.subscription_status !== 'trial') {
    return false;
  }

  if (user.subscription_expires_at) {
    const expiryDate = new Date(user.subscription_expires_at);
    const now = new Date();
    return expiryDate > now;
  }

  return true;
}

/**
 * Type guard: Check if user can create custom templates
 */
export function canCreateCustomTemplates(user: User): boolean {
  return SUBSCRIPTION_LIMITS[user.subscription_tier].features.custom_templates;
}
