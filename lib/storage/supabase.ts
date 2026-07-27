import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const supabaseKey = (process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const bucketName = (process.env.SUPABASE_STORAGE_BUCKET || 'media').trim().replace(/['"]/g, '');

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseKey);
}

export function getSupabaseClient() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase URL and API Key are not configured in environment variables');
  }
  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Uploads a file buffer directly to Supabase Storage and returns the public CDN URL
 */
export async function uploadToSupabaseStorage({
  fileBuffer,
  filename,
  contentType,
}: {
  fileBuffer: Buffer;
  filename: string;
  contentType: string;
}): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const supabase = getSupabaseClient();
    const filePath = `covers/${filename}`;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error('[Supabase Storage Upload Error]:', error);
      return { success: false, error: error.message };
    }

    // Retrieve public URL
    const { data: publicData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    return {
      success: true,
      url: publicData.publicUrl,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown Supabase upload error';
    return { success: false, error: message };
  }
}
