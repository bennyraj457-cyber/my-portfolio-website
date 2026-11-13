export type StoryStepId =
  | 'door'
  | 'room-overview'
  | 'bike-showroom'
  | 'notebook'
  | 'bookshelf'
  | 'music-player'
  | 'smartphone'
  | 'wall-art'
  | 'wall-note'
  | 'door-exit'

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
    id: 'door',
    stepNumber: 1,
    title: 'Studio Entrance',
    subtitle: 'Private Lab & Workspace 01',
    category: 'STUDIO ENTRANCE',
    hint: 'Scroll down or click the door handle to enter the room',
  },
  {
    id: 'room-overview',
    stepNumber: 2,
    title: 'Creative Studio',
    subtitle: '3D Workspace & Design Lab',
    category: 'OVERVIEW',
    hint: 'Scroll down to tour each station or click any object',
  },
  {
    id: 'bike-showroom',
    stepNumber: 3,
    title: '1970 Honda CB750 & Glass Patio',
    subtitle: 'Classic Super Sport & Sunlight Terrace Door',
    category: 'GARAGE SHOWCASE',
    hint: 'Scroll down to continue or click the glass door to slide open',
  },
  {
    id: 'notebook',
    stepNumber: 4,
    title: 'About Me Notebook',
    subtitle: 'Creative Developer & UI/UX Designer',
    category: 'BIOGRAPHY & PHILOSOPHY',
    hint: 'Scroll down to explore Skills & Tech Stack',
  },
  {
    id: 'bookshelf',
    stepNumber: 5,
    title: 'Skills & Tech Stack',
    subtitle: 'React • Three.js • TypeScript • UI/UX',
    category: 'KNOWLEDGE & CAPABILITIES',
    hint: 'Click any book to read or scroll down to continue',
  },
  {
    id: 'music-player',
    stepNumber: 6,
    title: 'Vintage Gramophone',
    subtitle: 'Soundtrack & Ambient Audio',
    category: 'AUDIO & AMBIENCE',
    hint: 'Play vinyl tracks or scroll down to continue',
  },
  {
    id: 'smartphone',
    stepNumber: 7,
    title: "Let's Connect",
    subtitle: 'Direct Messaging & Social Links',
    category: 'COMMUNICATION',
    hint: 'Tap a channel on the phone or scroll down to continue',
  },
  {
    id: 'wall-art',
    stepNumber: 8,
    title: 'Framed Gallery Art',
    subtitle: 'Live Artwork from Supabase',
    category: 'EXHIBITION',
    hint: 'Scroll down to view the Studio Notice Board',
  },
  {
    id: 'wall-note',
    stepNumber: 9,
    title: 'Studio Notice',
    subtitle: 'Workspace Expansion & Updates',
    category: 'NOTICE BOARD',
    hint: 'Scroll down to return to the studio door & exit',
  },
  {
    id: 'door-exit',
    stepNumber: 10,
    title: 'Studio Exit',
    subtitle: 'Returning to the Entrance Door',
    category: 'DEPARTURE',
    hint: 'Scroll down to exit the 3D studio to the footer',
  },
]
