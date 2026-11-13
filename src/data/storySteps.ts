export type StoryStepId =
  | 'room-overview'
  | 'bike-showroom'
  | 'notebook'
  | 'bookshelf'
  | 'music-player'
  | 'smartphone'
  | 'wall-art'
  | 'wall-note'

export interface StoryStep {
  id: StoryStepId
  stepNumber: number
  title: string
  subtitle: string
  category: string
  hint: string
}

export const STORY_STEPS: StoryStep[] = [
  {
    id: 'room-overview',
    stepNumber: 1,
    title: 'Creative Studio',
    subtitle: '3D Workspace & Design Lab',
    category: 'OVERVIEW',
    hint: 'Click Next or any object to explore each station',
  },
  {
    id: 'bike-showroom',
    stepNumber: 2,
    title: '1970 Honda CB750 & Glass Patio',
    subtitle: 'Classic Super Sport & Sunlight Terrace Door',
    category: 'GARAGE SHOWCASE',
    hint: 'Explore the vintage bike & garden terrace',
  },
  {
    id: 'notebook',
    stepNumber: 3,
    title: 'About Me Notebook',
    subtitle: 'Creative Developer & UI/UX Designer',
    category: 'BIOGRAPHY & PHILOSOPHY',
    hint: 'Browse Benny’s philosophy & design journey',
  },
  {
    id: 'bookshelf',
    stepNumber: 4,
    title: 'Skills & Tech Stack',
    subtitle: 'React • Three.js • TypeScript • UI/UX',
    category: 'KNOWLEDGE & CAPABILITIES',
    hint: 'Click any book to read or click Next to continue',
  },
  {
    id: 'music-player',
    stepNumber: 5,
    title: 'Vintage Gramophone',
    subtitle: 'Soundtrack & Ambient Audio',
    category: 'AUDIO & AMBIENCE',
    hint: 'Play vinyl tracks or click Next to continue',
  },
  {
    id: 'smartphone',
    stepNumber: 6,
    title: "Let's Connect",
    subtitle: 'Direct Messaging & Social Links',
    category: 'COMMUNICATION',
    hint: 'Tap a channel on the phone or click Next to continue',
  },
  {
    id: 'wall-art',
    stepNumber: 7,
    title: 'Framed Gallery Art',
    subtitle: 'Live Artwork from Supabase',
    category: 'EXHIBITION',
    hint: 'Click Next to view the Studio Notice Board',
  },
  {
    id: 'wall-note',
    stepNumber: 8,
    title: 'Studio Notice',
    subtitle: 'Workspace Expansion & Updates',
    category: 'NOTICE BOARD',
    hint: 'Click Footer to continue down the page',
  },
]
