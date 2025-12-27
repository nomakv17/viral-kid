// YouTube API client utilities

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

export interface YouTubeCredentialsForRefresh {
  clientId: string;
  clientSecret: string;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiresAt: Date | null;
}

export interface YouTubeComment {
  commentId: string;
  videoId: string;
  videoTitle: string;
  userComment: string;
  authorName: string;
  authorChannelId: string;
  likeCount: number;
  publishedAt: Date;
}

export interface YouTubeVideo {
  videoId: string;
  title: string;
}

/**
 * Refresh YouTube OAuth token if expired or about to expire
 */
export async function refreshTokenIfNeeded(
  credentials: YouTubeCredentialsForRefresh
): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
} | null> {
  if (!credentials.accessToken || !credentials.refreshToken) {
    return null;
  }

  // Check if token expires within 5 minutes
  const expiresAt = credentials.tokenExpiresAt;
  const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);

  if (expiresAt && expiresAt > fiveMinutesFromNow) {
    // Token is still valid
    return {
      accessToken: credentials.accessToken,
      refreshToken: credentials.refreshToken,
      expiresAt: expiresAt,
    };
  }

  // Refresh the token
  try {
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        refresh_token: credentials.refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to refresh YouTube token:", error);
      return null;
    }

    const data = await response.json();
    const newExpiresAt = new Date(Date.now() + data.expires_in * 1000);

    return {
      accessToken: data.access_token,
      // Google doesn't always return a new refresh token
      refreshToken: data.refresh_token || credentials.refreshToken,
      expiresAt: newExpiresAt,
    };
  } catch (error) {
    console.error("Failed to refresh YouTube token:", error);
    return null;
  }
}

/**
 * Fetch videos from the authenticated user's channel
 */
export async function fetchChannelVideos(
  accessToken: string,
  maxResults: number = 10
): Promise<YouTubeVideo[]> {
  // First, get the uploads playlist ID for the authenticated user's channel
  const channelResponse = await fetch(
    `${YOUTUBE_API_BASE}/channels?part=contentDetails&mine=true`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!channelResponse.ok) {
    throw new Error(`Failed to fetch channel: ${channelResponse.status}`);
  }

  const channelData = await channelResponse.json();
  const uploadsPlaylistId =
    channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

  if (!uploadsPlaylistId) {
    throw new Error("Could not find uploads playlist");
  }

  // Fetch videos from the uploads playlist
  const playlistResponse = await fetch(
    `${YOUTUBE_API_BASE}/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!playlistResponse.ok) {
    throw new Error(`Failed to fetch playlist: ${playlistResponse.status}`);
  }

  const playlistData = await playlistResponse.json();
  const videos: YouTubeVideo[] = [];

  for (const item of playlistData.items || []) {
    videos.push({
      videoId: item.snippet.resourceId.videoId,
      title: item.snippet.title,
    });
  }

  return videos;
}

/**
 * Fetch top-level comments for a specific video
 * Only returns comments that are NOT replies (top-level comments only)
 * Filters to comments from the last 7 days only
 */
export async function fetchVideoComments(
  accessToken: string,
  videoId: string,
  videoTitle: string,
  maxResults: number = 50
): Promise<YouTubeComment[]> {
  const response = await fetch(
    `${YOUTUBE_API_BASE}/commentThreads?part=snippet&videoId=${videoId}&maxResults=${maxResults}&order=relevance`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    // Handle case where comments are disabled
    if (response.status === 403) {
      console.log(`Comments disabled for video ${videoId}`);
      return [];
    }
    throw new Error(`Failed to fetch comments: ${response.status}`);
  }

  const data = await response.json();
  const comments: YouTubeComment[] = [];
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  for (const thread of data.items || []) {
    const comment = thread.snippet.topLevelComment;
    const snippet = comment.snippet;
    const publishedAt = new Date(snippet.publishedAt);

    // Only include comments from the last 7 days
    if (publishedAt < sevenDaysAgo) {
      continue;
    }

    comments.push({
      commentId: comment.id,
      videoId: videoId,
      videoTitle: videoTitle,
      userComment: snippet.textDisplay,
      authorName: snippet.authorDisplayName,
      authorChannelId: snippet.authorChannelId?.value || "",
      likeCount: snippet.likeCount || 0,
      publishedAt: publishedAt,
    });
  }

  return comments;
}

/**
 * Check if a comment has any replies from a specific channel
 * Returns true if there's already a reply from the channel owner
 */
export async function hasReplyFromChannel(
  accessToken: string,
  commentId: string,
  channelId: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `${YOUTUBE_API_BASE}/comments?part=snippet&parentId=${commentId}&maxResults=50`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      return false;
    }

    const data = await response.json();

    for (const reply of data.items || []) {
      if (reply.snippet.authorChannelId?.value === channelId) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Post a reply to a comment
 */
export async function postCommentReply(
  accessToken: string,
  parentCommentId: string,
  replyText: string
): Promise<string> {
  const response = await fetch(`${YOUTUBE_API_BASE}/comments?part=snippet`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      snippet: {
        parentId: parentCommentId,
        textOriginal: replyText,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to post reply: ${error}`);
  }

  const data = await response.json();
  return data.id;
}
