const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://qqercwgubhklohlgtddk.supabase.co'
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxZXJjd2d1YmhrbG9obGd0ZGRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0MDE0MjgsImV4cCI6MjEwODk3NzQyOH0.Yjs_9Lh-XlG7vE9DKsx4_GwrhgF8PNk6qxXw5w_5YAo'

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('your-project'),
)

/**
 * Lightweight PostgREST query helper (replaces heavy @supabase/supabase-js SDK).
 */
export async function supabaseRestSelect<T = Record<string, unknown>>(
  table: string,
  queryParams: string,
): Promise<{ data: T[] | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: null }
  }
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/${table}?${queryParams}`, {
      method: 'GET',
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        Accept: 'application/json',
      },
    })
    if (!res.ok) {
      return { data: null, error: new Error(`HTTP ${res.status}`) }
    }
    const data = (await res.json()) as T[]
    return { data, error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
  }
}

export interface StorageObjectItem {
  id?: string
  name: string
  created_at?: string
}

/**
 * Lightweight Supabase Storage list helper.
 */
export async function supabaseStorageList(
  bucket: string,
  limit = 25,
): Promise<{ data: StorageObjectItem[] | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: null }
  }
  try {
    const res = await fetch(`${supabaseUrl}/storage/v1/object/list/${bucket}`, {
      method: 'POST',
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prefix: '',
        limit,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      }),
    })
    if (!res.ok) {
      return { data: null, error: new Error(`HTTP ${res.status}`) }
    }
    const data = (await res.json()) as StorageObjectItem[]
    return { data, error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
  }
}

/**
 * Returns the public URL for a file in a public Supabase Storage bucket.
 */
export function supabaseStoragePublicUrl(bucket: string, fileName: string): string {
  const encoded = fileName
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/')
  return `${supabaseUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encoded}`
}
