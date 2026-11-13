import { useEffect, useState } from 'react'
import {
  isSupabaseConfigured,
  supabaseRestSelect,
  supabaseStorageList,
  supabaseStoragePublicUrl,
} from '@/lib/supabase'

export interface WallArtData {
  imageUrl: string | null
  title: string
  isLoading: boolean
}

interface WallArtRow {
  image_url?: string
  title?: string
  is_active?: boolean
}

// Module-level session cache so repeated renders never re-fetch
let cachedWallArt: { imageUrl: string | null; title: string; fetched: boolean } = {
  imageUrl: null,
  title: 'Geometric Study',
  fetched: false,
}

/**
 * Fetches active wall art image from Supabase 'wall_art' table or 'gallery' bucket.
 * Falls back gracefully to the clean default artwork if offline or not configured.
 */
export function useWallArt(): WallArtData {
  const [imageUrl, setImageUrl] = useState<string | null>(cachedWallArt.imageUrl)
  const [title, setTitle] = useState<string>(cachedWallArt.title)
  const [isLoading, setIsLoading] = useState<boolean>(!cachedWallArt.fetched)

  useEffect(() => {
    if (cachedWallArt.fetched) {
      setImageUrl(cachedWallArt.imageUrl)
      setTitle(cachedWallArt.title)
      setIsLoading(false)
      return
    }

    let isMounted = true

    async function fetchWallArt() {
      if (!isSupabaseConfigured) {
        cachedWallArt.fetched = true
        if (isMounted) setIsLoading(false)
        return
      }

      try {
        // 1. Try querying the 'wall_art' table for active artwork
        const { data, error } = await supabaseRestSelect<WallArtRow>(
          'wall_art',
          'select=image_url,title,is_active&is_active=eq.true&order=created_at.desc&limit=1',
        )

        if (!error && data && data.length > 0 && data[0].image_url) {
          cachedWallArt = {
            imageUrl: data[0].image_url,
            title: data[0].title || 'Geometric Study',
            fetched: true,
          }
          if (isMounted) {
            setImageUrl(cachedWallArt.imageUrl)
            setTitle(cachedWallArt.title)
            setIsLoading(false)
          }
          return
        }

        // 2. Alternatively check for an image in 'gallery' storage bucket
        const { data: bucketFiles } = await supabaseStorageList('gallery', 1)

        if (bucketFiles && bucketFiles.length > 0 && bucketFiles[0].name) {
          const publicUrl = supabaseStoragePublicUrl('gallery', bucketFiles[0].name)
          if (publicUrl) {
            cachedWallArt = {
              imageUrl: publicUrl,
              title: 'Geometric Study',
              fetched: true,
            }
            if (isMounted) {
              setImageUrl(publicUrl)
              setIsLoading(false)
            }
            return
          }
        }
      } catch {
        // Fallback gracefully
      }

      cachedWallArt.fetched = true
      if (isMounted) {
        setIsLoading(false)
      }
    }

    fetchWallArt()

    return () => {
      isMounted = false
    }
  }, [])

  return { imageUrl, title, isLoading }
}
