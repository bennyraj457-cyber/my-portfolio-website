import { useCallback, useEffect, useState } from 'react'
import { PLAYLIST, type Track } from '@/data/playlist'
import {
  isSupabaseConfigured,
  supabaseRestSelect,
  supabaseStorageList,
  supabaseStoragePublicUrl,
} from '@/lib/supabase'

export interface MusicPlayerState {
  playlist: Track[]
  currentTrackIndex: number
  currentTrack: Track
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number // 0 to 1
  isLoadingPlaylist: boolean
  togglePlay: () => void
  nextTrack: () => void
  prevTrack: () => void
  seekTo: (time: number) => void
  setVolume: (vol: number) => void
}

interface SongRow {
  id: string | number
  title?: string
  artist?: string
  duration?: number
  src: string
  cover_label?: string
}

let sharedAudio: HTMLAudioElement | null = null
let cachedSongsList: Track[] | null = null
let songsFetched = false

/**
 * Returns default start time (in seconds) for tracks that should skip an intro
 * (e.g. Dua Lipa - "Love Again" starts at 28s).
 */
function getTrackStartTime(track?: Partial<Track> | null): number {
  if (!track) return 0
  if (typeof track.startTime === 'number' && track.startTime > 0) {
    return track.startTime
  }
  const combined = `${track.title || ''} ${track.artist || ''} ${track.src || ''}`.toLowerCase()
  if (combined.includes('love again') || combined.includes('love_again') || combined.includes('dua')) {
    return 28
  }
  return 0
}

/**
 * Returns default end cutoff time (in seconds) for tracks that should stop early
 * (e.g. Dua Lipa - "Love Again" ends at 1m 20s = 80s).
 */
function getTrackEndTime(track?: Partial<Track> | null): number {
  if (!track) return 0
  if (typeof track.endTime === 'number' && track.endTime > 0) {
    return track.endTime
  }
  const combined = `${track.title || ''} ${track.artist || ''} ${track.src || ''}`.toLowerCase()
  if (combined.includes('love again') || combined.includes('love_again') || combined.includes('dua')) {
    return 80 // 1 min 20 sec
  }
  return 0
}

/**
 * Updates sound balance based on camera distance to the music player.
 * Player is located at (0.62, 0.88, -1.02).
 */
export function updateAudioListener(camX: number, camY: number, camZ: number) {
  if (!sharedAudio) return

  const dx = camX - 0.62
  const dy = camY - 0.88
  const dz = camZ - (-1.02)
  const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

  const currentBaseVol = Number(sharedAudio.dataset.baseVolume ?? 0.8)
  const distanceFactor = Math.max(0.45, Math.min(1.0, 1.25 / Math.max(0.7, dist)))
  sharedAudio.volume = Math.max(0, Math.min(1, currentBaseVol * distanceFactor))
}

export function useMusicPlayer(): MusicPlayerState {
  const [playlist, setPlaylist] = useState<Track[]>(cachedSongsList || PLAYLIST)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState((cachedSongsList || PLAYLIST)[0]?.duration || 10.8)
  const [volume, setVolumeState] = useState(0.8)
  const [isLoadingPlaylist, setIsLoadingPlaylist] = useState(isSupabaseConfigured && !songsFetched)

  const currentTrack = playlist[currentTrackIndex] || PLAYLIST[0]

  // 1. Fetch songs from Supabase ('songs' table + 'Songs' storage bucket fallback)
  useEffect(() => {
    if (!isSupabaseConfigured || songsFetched) return

    let isMounted = true

    async function fetchSongs() {
      try {
        const collectedTracks: Track[] = []

        // A. Query the 'songs' database table via lightweight REST
        const { data, error } = await supabaseRestSelect<SongRow>(
          'songs',
          'select=*&order=created_at.desc',
        )

        if (!error && data && data.length > 0) {
          for (const item of data) {
            const trackObj: Track = {
              id: String(item.id),
              title: item.title || 'Untitled Track',
              artist: item.artist || 'Studio Artist',
              duration: Number(item.duration) || 0,
              src: item.src,
              coverLabel: item.cover_label || 'POP / DISCO',
            }
            trackObj.startTime = getTrackStartTime(trackObj)
            trackObj.endTime = getTrackEndTime(trackObj)
            if (trackObj.endTime > 0) {
              trackObj.duration = trackObj.endTime
            }
            collectedTracks.push(trackObj)
          }
        }

        // B. Also check Supabase Storage 'Songs' / 'songs' buckets for uploaded audio files
        for (const bucketName of ['Songs', 'songs']) {
          const { data: bucketFiles, error: bucketError } = await supabaseStorageList(bucketName, 25)

          if (!bucketError && bucketFiles && bucketFiles.length > 0) {
            for (const file of bucketFiles) {
              if (
                !file.name ||
                file.name === '.emptyFolderPlaceholder' ||
                !/\.(mp3|wav|ogg|m4a|flac|aac)$/i.test(file.name)
              ) {
                continue
              }

              const publicUrl = supabaseStoragePublicUrl(bucketName, file.name)
              if (!publicUrl) continue

              const alreadyExists = collectedTracks.some(
                (t) => t.src.includes(encodeURIComponent(file.name)) || t.src.includes(file.name),
              )
              if (alreadyExists) continue

              const baseName = file.name
                .replace(/\.(mp3|wav|ogg|m4a|flac|aac)$/i, '')
                .replace(/_/g, ' ')
                .trim()
              let parsedArtist = 'Dua Lipa'
              let parsedTitle = baseName

              if (baseName.includes(' - ')) {
                const parts = baseName.split(' - ')
                parsedArtist = parts[0].trim()
                parsedTitle = parts.slice(1).join(' - ').trim()
              } else if (baseName.toLowerCase().includes('love again')) {
                parsedTitle = 'Love Again'
                parsedArtist = 'Dua Lipa'
              }

              const storageTrack: Track = {
                id: `storage-${file.id || file.name}`,
                title: parsedTitle,
                artist: parsedArtist,
                duration: 0,
                src: publicUrl,
                coverLabel: 'STUDIO STREAM',
              }
              storageTrack.startTime = getTrackStartTime(storageTrack)
              storageTrack.endTime = getTrackEndTime(storageTrack)
              if (storageTrack.endTime > 0) {
                storageTrack.duration = storageTrack.endTime
              }
              collectedTracks.unshift(storageTrack)
            }
          }
        }

        songsFetched = true
        if (collectedTracks.length > 0) {
          cachedSongsList = collectedTracks
          if (isMounted) {
            const firstStart = getTrackStartTime(collectedTracks[0])
            const firstEnd = getTrackEndTime(collectedTracks[0])
            setPlaylist(collectedTracks)
            setCurrentTrackIndex(0)
            setCurrentTime(firstStart)
            if (firstEnd > 0) {
              setDuration(firstEnd)
            }
            if (sharedAudio) {
              sharedAudio.src = collectedTracks[0].src
              sharedAudio.dataset.startTime = String(firstStart)
              sharedAudio.dataset.endTime = String(firstEnd)
            }
          }
        }
      } catch (err) {
        console.warn('Supabase fetch failed:', err)
      } finally {
        if (isMounted) setIsLoadingPlaylist(false)
      }
    }

    fetchSongs()

    return () => {
      isMounted = false
    }
  }, [])

  // 2. Initialize shared audio element once (with preload="metadata" so 1.4MB WAV files aren't downloaded until user clicks Play!)
  useEffect(() => {
    if (typeof window === 'undefined') return

    if (!sharedAudio) {
      sharedAudio = new Audio()
      sharedAudio.preload = 'none'
      sharedAudio.dataset.baseVolume = '0.8'
    }

    const audio = sharedAudio

    const handleTrackFinish = () => {
      setCurrentTrackIndex((prev) => {
        const nextIdx = (prev + 1) % playlist.length
        if (nextIdx === prev && sharedAudio) {
          const startOffset = Number(sharedAudio.dataset.startTime || 0)
          sharedAudio.currentTime = startOffset
          setCurrentTime(startOffset)
          sharedAudio.play().catch(() => {})
        }
        return nextIdx
      })
    }

    const updateTime = () => {
      const targetEnd = Number(audio.dataset.endTime || 0)
      if (targetEnd > 0 && audio.currentTime >= targetEnd) {
        handleTrackFinish()
        return
      }
      setCurrentTime(audio.currentTime)
      if (targetEnd > 0) {
        setDuration(targetEnd)
      } else if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration)
      }
    }

    const onLoadedMetadata = () => {
      const targetEnd = Number(audio.dataset.endTime || 0)
      if (targetEnd > 0) {
        setDuration(targetEnd)
      } else if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration)
      }
      const targetStart = Number(audio.dataset.startTime || 0)
      if (targetStart > 0 && audio.currentTime < targetStart - 0.5) {
        audio.currentTime = targetStart
        setCurrentTime(targetStart)
      }
    }

    const onEnded = () => {
      handleTrackFinish()
    }

    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('durationchange', onLoadedMetadata)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('durationchange', onLoadedMetadata)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
    }
  }, [playlist.length])

  // 3. Sync track src whenever currentTrack changes
  useEffect(() => {
    if (!sharedAudio || !currentTrack) return
    const audio = sharedAudio
    const wasPlaying = isPlaying
    const startOffset = getTrackStartTime(currentTrack)
    const endCutoff = getTrackEndTime(currentTrack)
    audio.dataset.startTime = String(startOffset)
    audio.dataset.endTime = String(endCutoff)
    if (endCutoff > 0) {
      setDuration(endCutoff)
    }

    if (audio.src !== currentTrack.src && wasPlaying) {
      audio.src = currentTrack.src
      audio.currentTime = startOffset
      setCurrentTime(startOffset)

      audio
        .play()
        .then(() => {
          if (startOffset > 0 && audio.currentTime < startOffset - 0.5) {
            audio.currentTime = startOffset
          }
        })
        .catch((err) => {
          console.warn('Audio play error:', err)
          setIsPlaying(false)
        })
    }
  }, [currentTrack, currentTrack?.src, currentTrackIndex, isPlaying])

  const togglePlay = useCallback(() => {
    if (!sharedAudio || !currentTrack) return
    const audio = sharedAudio
    const startOffset = getTrackStartTime(currentTrack)
    const endCutoff = getTrackEndTime(currentTrack)
    audio.dataset.startTime = String(startOffset)
    audio.dataset.endTime = String(endCutoff)
    if (endCutoff > 0) {
      setDuration(endCutoff)
    }

    if (!audio.src || audio.src !== currentTrack.src) {
      audio.src = currentTrack.src
      audio.currentTime = startOffset
      setCurrentTime(startOffset)
    } else if (
      audio.paused &&
      ((startOffset > 0 && audio.currentTime < startOffset - 0.5) ||
        (endCutoff > 0 && audio.currentTime >= endCutoff - 0.5))
    ) {
      audio.currentTime = startOffset
      setCurrentTime(startOffset)
    }

    if (audio.paused) {
      audio
        .play()
        .then(() => {
          if (startOffset > 0 && audio.currentTime < startOffset - 0.5) {
            audio.currentTime = startOffset
            setCurrentTime(startOffset)
          }
          setIsPlaying(true)
        })
        .catch((err) => {
          console.warn('Audio play blocked or missing:', err)
          setIsPlaying(false)
        })
    } else {
      audio.pause()
      setIsPlaying(false)
    }
  }, [currentTrack])

  const nextTrack = useCallback(() => {
    setCurrentTrackIndex((prev) => (prev + 1) % playlist.length)
  }, [playlist.length])

  const prevTrack = useCallback(() => {
    setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length)
  }, [playlist.length])

  const seekTo = useCallback((time: number) => {
    if (!sharedAudio) return
    sharedAudio.currentTime = time
    setCurrentTime(time)
  }, [])

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol))
    setVolumeState(clamped)
    if (sharedAudio) {
      sharedAudio.dataset.baseVolume = String(clamped)
      sharedAudio.volume = clamped
    }
  }, [])

  return {
    playlist,
    currentTrackIndex,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isLoadingPlaylist,
    togglePlay,
    nextTrack,
    prevTrack,
    seekTo,
    setVolume,
  }
}
