/**
 * Instagram-buzz Database Client - Usage Examples
 * Demonstrates common patterns and workflows
 * Version: 1.0.0
 */

// Example 1: Import and use the Supabase client
import {
  getUser,
  listReels,
  listGeneratedContents,
  markAsFavorite,
} from './client.js';

/**
 * Example 1: Get a user
 */
export async function exampleGetUser(userId: string) {
  const result = await getUser(userId);
  if (result.error) {
    console.error('Error:', result.error.message);
  } else {
    console.log('User:', result.data?.email);
  }
}

/**
 * Example 2: List user's reels with pagination
 */
export async function exampleListReels(userId: string) {
  const result = await listReels({
    user_id: userId,
    limit: 10,
    offset: 0,
  });

  console.log(`Found ${result.pagination.total_count} reels`);
  console.log(`Page ${result.pagination.page} of ${result.pagination.total_pages}`);

  result.data.forEach((reel) => {
    console.log(`- ${reel.shortcode}: ${reel.like_count} likes`);
  });
}

/**
 * Example 3: List favorite generated contents
 */
export async function exampleListFavorites(userId: string) {
  const result = await listGeneratedContents({
    user_id: userId,
    is_favorite: true,
    order_by: 'created_at',
    order_direction: 'desc',
    limit: 5,
  });

  result.data.forEach((content) => {
    console.log(`- [${content.content_type}] Quality: ${content.quality_score}`);
  });
}

/**
 * Example 4: Mark content as favorite
 */
export async function exampleMarkFavorite(contentId: string) {
  const result = await markAsFavorite(contentId);
  if (result.error) {
    console.error('Error:', result.error.message);
  } else {
    console.log('Marked as favorite!');
  }
}
