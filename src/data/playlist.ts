export interface Track {
  id: string
  title: string
  artist: string
  duration: number // in seconds
  src: string
  coverLabel: string
  startTime?: number // optional start offset in seconds
  endTime?: number // optional end cutoff in seconds
}

export const PLAYLIST: Track[] = [
  {
    id: 'track-1',
    title: 'Aureolin Serenade',
    artist: 'Antigravity Studio',
    duration: 10.8,
    src: '/audio/track-1.wav',
    coverLabel: 'CHILL / LO-FI',
  },
  {
    id: 'track-2',
    title: 'Midnight Botanica',
    artist: 'Vintage Gramophone',
    duration: 10.8,
    src: '/audio/track-2.wav',
    coverLabel: 'JAZZ / VINYL',
  },
  {
    id: 'track-3',
    title: 'Studio Groove',
    artist: 'Analog Dreams',
    duration: 10.8,
    src: '/audio/track-3.wav',
    coverLabel: 'DOWNTEMPO',
  },
]

