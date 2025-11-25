/**
 * Instagram-buzz Supabase Client
 * Provides typed database operations for all tables
 * Version: 1.0.0
 */

import { createClient } from '@supabase/supabase-js';
import type {
  User,
  UserInsert,
  UserUpdate,
  Reel,
  ReelInsert,
  ReelUpdate,
  Template,
  TemplateInsert,
  TemplateUpdate,
  GeneratedContent,
  GeneratedContentInsert,
  GeneratedContentUpdate,
  ReelWithUser,
  GeneratedContentWithRelations,
  TemplateWithStats,
  UserWithStats,
  ApiResponse,
  PaginatedResponse,
  ReelFilterOptions,
  TemplateFilterOptions,
  GeneratedContentFilterOptions,
} from './types.js';
import { TABLE_NAMES } from './types.js';

/**
 * Initialize Supabase client
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('⚠️  Supabase credentials not configured. Database operations will fail.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// =============================================================================
// USERS OPERATIONS
// =============================================================================

/**
 * Get user by ID
 */
export async function getUser(userId: string): Promise<ApiResponse<User>> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAMES.USERS)
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return {
        data: null,
        error: { message: error.message, code: error.code },
        status: 400,
      };
    }

    return { data, error: null, status: 200 };
  } catch (err) {
    return {
      data: null,
      error: { message: (err as Error).message },
      status: 500,
    };
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<ApiResponse<User>> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAMES.USERS)
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      return {
        data: null,
        error: { message: error.message, code: error.code },
        status: 400,
      };
    }

    return { data, error: null, status: 200 };
  } catch (err) {
    return {
      data: null,
      error: { message: (err as Error).message },
      status: 500,
    };
  }
}

/**
 * Create new user
 */
export async function createUser(user: UserInsert): Promise<ApiResponse<User>> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAMES.USERS)
      .insert([user])
      .select()
      .single();

    if (error) {
      return {
        data: null,
        error: { message: error.message, code: error.code },
        status: 400,
      };
    }

    return { data, error: null, status: 201 };
  } catch (err) {
    return {
      data: null,
      error: { message: (err as Error).message },
      status: 500,
    };
  }
}

/**
 * Update user
 */
export async function updateUser(
  userId: string,
  updates: UserUpdate
): Promise<ApiResponse<User>> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAMES.USERS)
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return {
        data: null,
        error: { message: error.message, code: error.code },
        status: 400,
      };
    }

    return { data, error: null, status: 200 };
  } catch (err) {
    return {
      data: null,
      error: { message: (err as Error).message },
      status: 500,
    };
  }
}

/**
 * Get user with statistics
 */
export async function getUserWithStats(userId: string): Promise<ApiResponse<UserWithStats>> {
  try {
    const { data: user, error: userError } = await supabase
      .from(TABLE_NAMES.USERS)
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return {
        data: null,
        error: { message: userError?.message || 'User not found' },
        status: 400,
      };
    }

    // Get statistics
    const { count: reelsCount } = await supabase
      .from(TABLE_NAMES.REELS)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { count: templatesCount } = await supabase
      .from(TABLE_NAMES.TEMPLATES)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { count: favoritesCount } = await supabase
      .from(TABLE_NAMES.GENERATED_CONTENTS)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_favorite', true);

    const { data: ratings } = await supabase
      .from(TABLE_NAMES.GENERATED_CONTENTS)
      .select('user_rating')
      .eq('user_id', userId)
      .not('user_rating', 'is', null);

    const avgRating =
      ratings && ratings.length > 0
        ? ratings.reduce((sum: number, r) => sum + (r.user_rating || 0), 0) / ratings.length
        : 0;

    return {
      data: {
        ...user,
        total_reels_count: reelsCount || 0,
        total_templates_count: templatesCount || 0,
        favorite_contents_count: favoritesCount || 0,
        average_content_rating: avgRating,
      },
      error: null,
      status: 200,
    };
  } catch (err) {
    return {
      data: null,
      error: { message: (err as Error).message },
      status: 500,
    };
  }
}

// =============================================================================
// REELS OPERATIONS
// =============================================================================

/**
 * Get reel by ID
 */
export async function getReel(reelId: string): Promise<ApiResponse<Reel>> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAMES.REELS)
      .select('*')
      .eq('id', reelId)
      .single();

    if (error) {
      return {
        data: null,
        error: { message: error.message, code: error.code },
        status: 400,
      };
    }

    return { data, error: null, status: 200 };
  } catch (err) {
    return {
      data: null,
      error: { message: (err as Error).message },
      status: 500,
    };
  }
}

/**
 * Get reel with user information
 */
export async function getReelWithUser(reelId: string): Promise<ApiResponse<ReelWithUser>> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAMES.REELS)
      .select('*, user:user_id(*)')
      .eq('id', reelId)
      .single();

    if (error) {
      return {
        data: null,
        error: { message: error.message, code: error.code },
        status: 400,
      };
    }

    return { data, error: null, status: 200 };
  } catch (err) {
    return {
      data: null,
      error: { message: (err as Error).message },
      status: 500,
    };
  }
}

/**
 * List reels with filters and pagination
 */
export async function listReels(
  filters: ReelFilterOptions = {}
): Promise<PaginatedResponse<Reel>> {
  try {
    const {
      limit = 20,
      offset = 0,
      order_by = 'created_at',
      order_direction = 'desc',
      user_id,
      creator_username,
      content_type,
      min_virality_score,
      fetch_status,
      analysis_status,
      created_after,
      created_before,
    } = filters;

    let query = supabase.from(TABLE_NAMES.REELS).select('*', { count: 'exact' });

    // Apply filters
    if (user_id) query = query.eq('user_id', user_id);
    if (creator_username) query = query.eq('creator_username', creator_username);
    if (content_type) query = query.eq('content_type', content_type);
    if (min_virality_score !== undefined)
      query = query.gte('virality_score', min_virality_score);
    if (fetch_status) query = query.eq('fetch_status', fetch_status);
    if (analysis_status) query = query.eq('analysis_status', analysis_status);
    if (created_after) query = query.gte('created_at', created_after);
    if (created_before) query = query.lte('created_at', created_before);

    // Order and paginate
    query = query.order(order_by as any, { ascending: order_direction === 'asc' });
    const { data, count, error } = await query.range(offset, offset + limit - 1);

    if (error) {
      return {
        data: [],
        pagination: {
          page: Math.floor(offset / limit) + 1,
          page_size: limit,
          total_count: 0,
          total_pages: 0,
          has_next: false,
          has_previous: false,
        },
        error: { message: error.message, code: error.code },
      };
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);
    const page = Math.floor(offset / limit) + 1;

    return {
      data: data || [],
      pagination: {
        page,
        page_size: limit,
        total_count: total,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_previous: page > 1,
      },
      error: null,
    };
  } catch (err) {
    return {
      data: [],
      pagination: {
        page: 1,
        page_size: 20,
        total_count: 0,
        total_pages: 0,
        has_next: false,
        has_previous: false,
      },
      error: { message: (err as Error).message },
    };
  }
}

/**
 * Create new reel
 */
export async function createReel(reel: ReelInsert): Promise<ApiResponse<Reel>> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAMES.REELS)
      .insert([reel])
      .select()
      .single();

    if (error) {
      return {
        data: null,
        error: { message: error.message, code: error.code },
        status: 400,
      };
    }

    return { data, error: null, status: 201 };
  } catch (err) {
    return {
      data: null,
      error: { message: (err as Error).message },
      status: 500,
    };
  }
}

/**
 * Update reel
 */
export async function updateReel(
  reelId: string,
  updates: ReelUpdate
): Promise<ApiResponse<Reel>> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAMES.REELS)
      .update(updates)
      .eq('id', reelId)
      .select()
      .single();

    if (error) {
      return {
        data: null,
        error: { message: error.message, code: error.code },
        status: 400,
      };
    }

    return { data, error: null, status: 200 };
  } catch (err) {
    return {
      data: null,
      error: { message: (err as Error).message },
      status: 500,
    };
  }
}

/**
 * Delete reel
 */
export async function deleteReel(reelId: string): Promise<ApiResponse<null>> {
  try {
    const { error } = await supabase.from(TABLE_NAMES.REELS).delete().eq('id', reelId);

    if (error) {
      return {
        data: null,
        error: { message: error.message, code: error.code },
        status: 400,
      };
    }

    return { data: null, error: null, status: 200 };
  } catch (err) {
    return {
      data: null,
      error: { message: (err as Error).message },
      status: 500,
    };
  }
}

// =============================================================================
// TEMPLATES OPERATIONS
// =============================================================================

/**
 * Get template by ID
 */
export async function getTemplate(templateId: string): Promise<ApiResponse<Template>> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAMES.TEMPLATES)
      .select('*')
      .eq('id', templateId)
      .single();

    if (error) {
      return {
        data: null,
        error: { message: error.message, code: error.code },
        status: 400,
      };
    }

    return { data, error: null, status: 200 };
  } catch (err) {
    return {
      data: null,
      error: { message: (err as Error).message },
      status: 500,
    };
  }
}

/**
 * List templates with filters and pagination
 */
export async function listTemplates(
  filters: TemplateFilterOptions = {}
): Promise<PaginatedResponse<Template>> {
  try {
    const {
      limit = 20,
      offset = 0,
      order_by = 'created_at',
      order_direction = 'desc',
      user_id,
      category,
      tone,
      is_public,
      is_system_template,
      search_query,
    } = filters;

    let query = supabase.from(TABLE_NAMES.TEMPLATES).select('*', { count: 'exact' });

    // Apply filters
    if (user_id) query = query.eq('user_id', user_id);
    if (category) query = query.eq('category', category);
    if (tone) query = query.eq('tone', tone);
    if (is_public !== undefined) query = query.eq('is_public', is_public);
    if (is_system_template !== undefined) query = query.eq('is_system_template', is_system_template);
    if (search_query)
      query = query.or(`name.ilike.%${search_query}%,description.ilike.%${search_query}%`);

    // Filter out deleted templates by default
    query = query.is('deleted_at', null);

    // Order and paginate
    query = query.order(order_by as any, { ascending: order_direction === 'asc' });
    const { data, count, error } = await query.range(offset, offset + limit - 1);

    if (error) {
      return {
        data: [],
        pagination: {
          page: Math.floor(offset / limit) + 1,
          page_size: limit,
          total_count: 0,
          total_pages: 0,
          has_next: false,
          has_previous: false,
        },
        error: { message: error.message, code: error.code },
      };
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);
    const page = Math.floor(offset / limit) + 1;

    return {
      data: data || [],
      pagination: {
        page,
        page_size: limit,
        total_count: total,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_previous: page > 1,
      },
      error: null,
    };
  } catch (err) {
    return {
      data: [],
      pagination: {
        page: 1,
        page_size: 20,
        total_count: 0,
        total_pages: 0,
        has_next: false,
        has_previous: false,
      },
      error: { message: (err as Error).message },
    };
  }
}

/**
 * Get template with statistics
 */
export async function getTemplateWithStats(
  templateId: string
): Promise<ApiResponse<TemplateWithStats>> {
  try {
    const { data: template, error: templateError } = await supabase
      .from(TABLE_NAMES.TEMPLATES)
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError || !template) {
      return {
        data: null,
        error: { message: templateError?.message || 'Template not found' },
        status: 400,
      };
    }

    // Get recent generations count (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { count: recentCount } = await supabase
      .from(TABLE_NAMES.GENERATED_CONTENTS)
      .select('*', { count: 'exact', head: true })
      .eq('template_id', templateId)
      .gte('created_at', thirtyDaysAgo);

    // Get average quality score
    const { data: qualityScores } = await supabase
      .from(TABLE_NAMES.GENERATED_CONTENTS)
      .select('quality_score')
      .eq('template_id', templateId)
      .not('quality_score', 'is', null);

    const avgQuality =
      qualityScores && qualityScores.length > 0
        ? qualityScores.reduce((sum: number, q) => sum + (q.quality_score || 0), 0) / qualityScores.length
        : 0;

    // Get average user rating
    const { data: userRatings } = await supabase
      .from(TABLE_NAMES.GENERATED_CONTENTS)
      .select('user_rating')
      .eq('template_id', templateId)
      .not('user_rating', 'is', null);

    const avgRating =
      userRatings && userRatings.length > 0
        ? userRatings.reduce((sum: number, r) => sum + (r.user_rating || 0), 0) / userRatings.length
        : 0;

    return {
      data: {
        ...template,
        recent_generations_count: recentCount || 0,
        average_quality_score: avgQuality,
        average_user_rating: avgRating,
      },
      error: null,
      status: 200,
    };
  } catch (err) {
    return {
      data: null,
      error: { message: (err as Error).message },
      status: 500,
    };
  }
}

/**
 * Create new template
 */
export async function createTemplate(template: TemplateInsert): Promise<ApiResponse<Template>> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAMES.TEMPLATES)
      .insert([template])
      .select()
      .single();

    if (error) {
      return {
        data: null,
        error: { message: error.message, code: error.code },
        status: 400,
      };
    }

    return { data, error: null, status: 201 };
  } catch (err) {
    return {
      data: null,
      error: { message: (err as Error).message },
      status: 500,
    };
  }
}

/**
 * Update template
 */
export async function updateTemplate(
  templateId: string,
  updates: TemplateUpdate
): Promise<ApiResponse<Template>> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAMES.TEMPLATES)
      .update(updates)
      .eq('id', templateId)
      .select()
      .single();

    if (error) {
      return {
        data: null,
        error: { message: error.message, code: error.code },
        status: 400,
      };
    }

    return { data, error: null, status: 200 };
  } catch (err) {
    return {
      data: null,
      error: { message: (err as Error).message },
      status: 500,
    };
  }
}

/**
 * Soft delete template
 */
export async function deleteTemplate(templateId: string): Promise<ApiResponse<null>> {
  try {
    const { error } = await supabase
      .from(TABLE_NAMES.TEMPLATES)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', templateId);

    if (error) {
      return {
        data: null,
        error: { message: error.message, code: error.code },
        status: 400,
      };
    }

    return { data: null, error: null, status: 200 };
  } catch (err) {
    return {
      data: null,
      error: { message: (err as Error).message },
      status: 500,
    };
  }
}

// =============================================================================
// GENERATED CONTENTS OPERATIONS
// =============================================================================

/**
 * Get generated content by ID
 */
export async function getGeneratedContent(
  contentId: string
): Promise<ApiResponse<GeneratedContent>> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAMES.GENERATED_CONTENTS)
      .select('*')
      .eq('id', contentId)
      .single();

    if (error) {
      return {
        data: null,
        error: { message: error.message, code: error.code },
        status: 400,
      };
    }

    return { data, error: null, status: 200 };
  } catch (err) {
    return {
      data: null,
      error: { message: (err as Error).message },
      status: 500,
    };
  }
}

/**
 * Get generated content with all relations
 */
export async function getGeneratedContentWithRelations(
  contentId: string
): Promise<ApiResponse<GeneratedContentWithRelations>> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAMES.GENERATED_CONTENTS)
      .select('*, user:user_id(*), reel:reel_id(*), template:template_id(*)')
      .eq('id', contentId)
      .single();

    if (error) {
      return {
        data: null,
        error: { message: error.message, code: error.code },
        status: 400,
      };
    }

    return { data, error: null, status: 200 };
  } catch (err) {
    return {
      data: null,
      error: { message: (err as Error).message },
      status: 500,
    };
  }
}

/**
 * List generated contents with filters and pagination
 */
export async function listGeneratedContents(
  filters: GeneratedContentFilterOptions = {}
): Promise<PaginatedResponse<GeneratedContent>> {
  try {
    const {
      limit = 20,
      offset = 0,
      order_by = 'created_at',
      order_direction = 'desc',
      user_id,
      reel_id,
      template_id,
      content_type,
      is_favorite,
      is_used,
      min_quality_score,
      generation_status,
      created_after,
      created_before,
    } = filters;

    let query = supabase.from(TABLE_NAMES.GENERATED_CONTENTS).select('*', { count: 'exact' });

    // Apply filters
    if (user_id) query = query.eq('user_id', user_id);
    if (reel_id) query = query.eq('reel_id', reel_id);
    if (template_id) query = query.eq('template_id', template_id);
    if (content_type) query = query.eq('content_type', content_type);
    if (is_favorite !== undefined) query = query.eq('is_favorite', is_favorite);
    if (is_used !== undefined) query = query.eq('is_used', is_used);
    if (min_quality_score !== undefined) query = query.gte('quality_score', min_quality_score);
    if (generation_status) query = query.eq('generation_status', generation_status);
    if (created_after) query = query.gte('created_at', created_after);
    if (created_before) query = query.lte('created_at', created_before);

    // Order and paginate
    query = query.order(order_by as any, { ascending: order_direction === 'asc' });
    const { data, count, error } = await query.range(offset, offset + limit - 1);

    if (error) {
      return {
        data: [],
        pagination: {
          page: Math.floor(offset / limit) + 1,
          page_size: limit,
          total_count: 0,
          total_pages: 0,
          has_next: false,
          has_previous: false,
        },
        error: { message: error.message, code: error.code },
      };
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);
    const page = Math.floor(offset / limit) + 1;

    return {
      data: data || [],
      pagination: {
        page,
        page_size: limit,
        total_count: total,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_previous: page > 1,
      },
      error: null,
    };
  } catch (err) {
    return {
      data: [],
      pagination: {
        page: 1,
        page_size: 20,
        total_count: 0,
        total_pages: 0,
        has_next: false,
        has_previous: false,
      },
      error: { message: (err as Error).message },
    };
  }
}

/**
 * Create new generated content
 */
export async function createGeneratedContent(
  content: GeneratedContentInsert
): Promise<ApiResponse<GeneratedContent>> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAMES.GENERATED_CONTENTS)
      .insert([content])
      .select()
      .single();

    if (error) {
      return {
        data: null,
        error: { message: error.message, code: error.code },
        status: 400,
      };
    }

    return { data, error: null, status: 201 };
  } catch (err) {
    return {
      data: null,
      error: { message: (err as Error).message },
      status: 500,
    };
  }
}

/**
 * Update generated content
 */
export async function updateGeneratedContent(
  contentId: string,
  updates: GeneratedContentUpdate
): Promise<ApiResponse<GeneratedContent>> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAMES.GENERATED_CONTENTS)
      .update(updates)
      .eq('id', contentId)
      .select()
      .single();

    if (error) {
      return {
        data: null,
        error: { message: error.message, code: error.code },
        status: 400,
      };
    }

    return { data, error: null, status: 200 };
  } catch (err) {
    return {
      data: null,
      error: { message: (err as Error).message },
      status: 500,
    };
  }
}

/**
 * Mark generated content as favorite
 */
export async function markAsFavorite(contentId: string): Promise<ApiResponse<GeneratedContent>> {
  return updateGeneratedContent(contentId, { is_favorite: true });
}

/**
 * Mark generated content as used
 */
export async function markAsUsed(contentId: string): Promise<ApiResponse<GeneratedContent>> {
  return updateGeneratedContent(contentId, {
    is_used: true,
    used_at: new Date().toISOString(),
  });
}

/**
 * Rate generated content
 */
export async function rateGeneratedContent(
  contentId: string,
  rating: number,
  feedback?: string
): Promise<ApiResponse<GeneratedContent>> {
  if (rating < 1 || rating > 5) {
    return {
      data: null,
      error: { message: 'Rating must be between 1 and 5' },
      status: 400,
    };
  }

  return updateGeneratedContent(contentId, {
    user_rating: rating,
    user_feedback: feedback,
  });
}

/**
 * Delete generated content
 */
export async function deleteGeneratedContent(contentId: string): Promise<ApiResponse<null>> {
  try {
    const { error } = await supabase
      .from(TABLE_NAMES.GENERATED_CONTENTS)
      .delete()
      .eq('id', contentId);

    if (error) {
      return {
        data: null,
        error: { message: error.message, code: error.code },
        status: 400,
      };
    }

    return { data: null, error: null, status: 200 };
  } catch (err) {
    return {
      data: null,
      error: { message: (err as Error).message },
      status: 500,
    };
  }
}

// =============================================================================
// ANALYTICS & STATISTICS OPERATIONS
// =============================================================================

/**
 * Get user generation metrics (monthly vs total)
 */
export async function getUserGenerationMetrics(
  userId: string
): Promise<
  ApiResponse<{
    monthly_generations: number;
    total_generations: number;
    last_generation_at: string | null;
  }>
> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAMES.USERS)
      .select('monthly_generation_count, total_generation_count, last_generation_at')
      .eq('id', userId)
      .single();

    if (error) {
      return {
        data: null,
        error: { message: error.message, code: error.code },
        status: 400,
      };
    }

    return {
      data: {
        monthly_generations: data.monthly_generation_count,
        total_generations: data.total_generation_count,
        last_generation_at: data.last_generation_at,
      },
      error: null,
      status: 200,
    };
  } catch (err) {
    return {
      data: null,
      error: { message: (err as Error).message },
      status: 500,
    };
  }
}

/**
 * Get average quality metrics for generated content
 */
export async function getAverageQualityMetrics(
  userId: string
): Promise<
  ApiResponse<{
    average_quality_score: number;
    average_readability_score: number;
    average_engagement_prediction: number;
  }>
> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAMES.GENERATED_CONTENTS)
      .select('quality_score, readability_score, engagement_prediction')
      .eq('user_id', userId)
      .not('quality_score', 'is', null);

    if (error) {
      return {
        data: null,
        error: { message: error.message, code: error.code },
        status: 400,
      };
    }

    const avgQuality =
      data && data.length > 0
        ? data.reduce((sum: number, d) => sum + (d.quality_score || 0), 0) / data.length
        : 0;

    const avgReadability =
      data && data.length > 0
        ? data.reduce((sum: number, d) => sum + (d.readability_score || 0), 0) / data.length
        : 0;

    const avgEngagement =
      data && data.length > 0
        ? data.reduce((sum: number, d) => sum + (d.engagement_prediction || 0), 0) / data.length
        : 0;

    return {
      data: {
        average_quality_score: avgQuality,
        average_readability_score: avgReadability,
        average_engagement_prediction: avgEngagement,
      },
      error: null,
      status: 200,
    };
  } catch (err) {
    return {
      data: null,
      error: { message: (err as Error).message },
      status: 500,
    };
  }
}

// =============================================================================
// EXPORT
// =============================================================================

export { supabase };
