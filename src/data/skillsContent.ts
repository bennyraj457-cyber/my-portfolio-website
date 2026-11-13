import type { SkillBookId } from '@/components/hero/scene/SkillBookCollection'

export interface SkillItem {
  name: string
  detail: string
  tag: string
}

export interface BookSkillsContent {
  id: SkillBookId
  title: string
  subtitle: string
  volume: string
  coverColor: string
  accentColor: string
  headline: string
  skills: SkillItem[]
}

export const SKILLS_DATA: Record<SkillBookId, BookSkillsContent> = {
  html: {
    id: 'html',
    title: 'HTML',
    subtitle: 'SEMANTIC WEB ARCHITECTURE',
    volume: '01',
    coverColor: '#e44d26',
    accentColor: '#f5d000',
    headline: 'Structure, accessibility, and modern semantic standards.',
    skills: [
      {
        name: 'Semantic HTML',
        detail: 'Meaningful elements (article, section, nav, main, aside) for robust document outlines.',
        tag: 'Core',
      },
      {
        name: 'Page structure',
        detail: 'Clean hierarchy, landmark roles, and structured data schemas for fast parsing.',
        tag: 'Layout',
      },
      {
        name: 'Forms & accessibility',
        detail: 'WCAG AAA, ARIA attributes, keyboard focus states, and native input validations.',
        tag: 'A11y',
      },
      {
        name: 'SEO-friendly markup',
        detail: 'OpenGraph, Twitter cards, meta viewports, canonical tags, and rich snippet schemas.',
        tag: 'SEO',
      },
      {
        name: 'Modern HTML5',
        detail: 'Dialog API, template tags, web components, canvas, and audio/video streaming.',
        tag: 'Modern',
      },
    ],
  },
  css: {
    id: 'css',
    title: 'CSS',
    subtitle: 'RESPONSIVE SYSTEMS & MOTION',
    volume: '02',
    coverColor: '#264de4',
    accentColor: '#f5d000',
    headline: 'Fluid layouts, responsive tokens, and micro-interactions.',
    skills: [
      {
        name: 'Responsive layouts',
        detail: 'Container queries, fluid typography, clamp() scaling, and multi-screen ergonomics.',
        tag: 'Layout',
      },
      {
        name: 'Flexbox & Grid',
        detail: 'Two-dimensional alignment, subgrid layouts, auto-fill/auto-fit modular matrices.',
        tag: 'Flow',
      },
      {
        name: 'Animations & transitions',
        detail: 'Hardware-accelerated transforms, spring easing curves, and CSS keyframe choreographies.',
        tag: 'Motion',
      },
      {
        name: 'Modern CSS',
        detail: 'Native CSS nesting, :has() parent selectors, color-mix(), and design token custom properties.',
        tag: 'CSSNext',
      },
      {
        name: 'Responsive web design',
        detail: 'Mobile-first breakpoints, dark/light theme switching, and prefers-reduced-motion.',
        tag: 'Design',
      },
    ],
  },
  react: {
    id: 'react',
    title: 'React',
    subtitle: 'COMPONENT & STATE ARCHITECTURE',
    volume: '03',
    coverColor: '#00d8ff',
    accentColor: '#f5d000',
    headline: 'Component lifecycle, reactive state, and TypeScript safety.',
    skills: [
      {
        name: 'React components',
        detail: 'Composable functional components, custom hooks, and Compound Component patterns.',
        tag: 'Architecture',
      },
      {
        name: 'Hooks & state management',
        detail: 'Context, useReducer, Zustand, React Three Fiber hooks, and state machines.',
        tag: 'State',
      },
      {
        name: 'TypeScript',
        detail: 'Strict generic types, discriminating unions, and zero-runtime type safety.',
        tag: 'Types',
      },
      {
        name: 'API integration',
        detail: 'REST, GraphQL, Supabase real-time subscriptions, optimistic UI updates.',
        tag: 'Data',
      },
      {
        name: 'Reusable UI development',
        detail: 'Accessible design system tokens, Tailwind CSS, headless primitives, and R3F canvases.',
        tag: 'UI/UX',
      },
    ],
  },
  figma: {
    id: 'figma',
    title: 'Figma',
    subtitle: 'INTERFACE & DESIGN SYSTEMS',
    volume: '04',
    coverColor: '#a259ff',
    accentColor: '#f5d000',
    headline: 'Design tokens, auto-layout components, and rapid prototyping.',
    skills: [
      {
        name: 'UI/UX design',
        detail: 'User research flows, wireframing, high-fidelity visual design, and accessibility testing.',
        tag: 'Design',
      },
      {
        name: 'Wireframing',
        detail: 'Low-fidelity layout exploration, user journey maps, and rapid information architecture.',
        tag: 'Process',
      },
      {
        name: 'Prototyping',
        detail: 'Smart animate transitions, interactive component variants, and clickable user testing.',
        tag: 'Prototype',
      },
      {
        name: 'Auto Layout',
        detail: 'Fluid responsiveness, nested auto-layout constraints, and dynamic content resizing.',
        tag: 'Layout',
      },
      {
        name: 'Components & design systems',
        detail: 'Atomic design tokens, variant properties, slot architectures, and Code Connect handoff.',
        tag: 'Systems',
      },
    ],
  },
  'adobe-illustrator': {
    id: 'adobe-illustrator',
    title: 'Adobe Illustrator',
    subtitle: 'VECTOR PRECISION & BRAND ASSETS',
    volume: '05',
    coverColor: '#ff9a00',
    accentColor: '#f5d000',
    headline: 'Scalable vector geometry, icons, and geometric brand assets.',
    skills: [
      {
        name: 'Vector graphics',
        detail: 'Bézier curves, Pathfinder Boolean operations, gradient meshes, and precision SVG output.',
        tag: 'Vector',
      },
      {
        name: 'Icon design',
        detail: 'Pixel-grid alignment, consistent stroke weights, optical balance, and multi-size sets.',
        tag: 'Icons',
      },
      {
        name: 'Logo design',
        detail: 'Brand identities, responsive marks, typography lockups, and geometric construction grids.',
        tag: 'Branding',
      },
      {
        name: 'Illustrations',
        detail: 'Custom editorial vector illustrations, isometric compositions, and character stylings.',
        tag: 'Artwork',
      },
      {
        name: 'Visual assets',
        detail: 'Export workflows for modern web, CSS sprite generation, lossless SVG optimization.',
        tag: 'Assets',
      },
    ],
  },
}

