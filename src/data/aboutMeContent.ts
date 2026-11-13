/**
 * Editable About Me Notebook content configuration.
 * Update your name, headline, bio quote, and skills list here at any time.
 */
export interface AboutMeContentConfig {
  /** Cover title embossed on the front of the black hardcover notebook */
  coverTitle: string
  /** Cover archival subtitle */
  coverSubtitle: string
  /** Inside greeting header — e.g. "HELLO, I'M [YOUR NAME]" */
  greeting: string
  /** Primary role / discipline subtitle */
  role: string
  /** Personal quote / bio statement */
  quote: string
  /** Section title for capabilities */
  whatIDoTitle: string
  /** List of core capabilities displayed on the notebook spread */
  whatIDoItems: string[]
  /** Optional footer metadata printed at the bottom of the notebook pages */
  leftPageFooter: string
  rightPageFooter: string
}

export const ABOUT_ME_CONTENT: AboutMeContentConfig = {
  coverTitle: 'ABOUT ME',
  coverSubtitle: 'VOL. 01 — PROFILE',
  greeting: "HELLO, I'm BENNY R",
  role: 'UI/UX DESIGNER & WEB DESIGNER',
  quote:
    '"I enjoy transforming ideas into thoughtful digital experiences. I work across interface design and frontend development, bringing designs to life through creativity and code."',
  whatIDoTitle: 'WHAT I DO',
  whatIDoItems: [
    'UI/UX Design',
    'Web Design',
    'Frontend Development',
    'Website Development',
  ],
  leftPageFooter: '01 / PERSONAL PROFILE',
  rightPageFooter: '02 / DISCIPLINES & CRAFT',
}

