/**
 * Aureolin Botanica — Design System Tokens
 * Single source of truth generated from design-system.md (Google Stitch AI)
 */

export const DESIGN_SYSTEM_NAME = 'Aureolin Botanica' as const

export const colors = {
  surface: '#fbf9f3',
  'surface-dim': '#dcdad4',
  'surface-bright': '#fbf9f3',
  'surface-container-lowest': '#ffffff',
  'surface-container-low': '#f5f3ee',
  'surface-container': '#f0eee8',
  'surface-container-high': '#eae8e2',
  'surface-container-highest': '#e4e2dd',
  'on-surface': '#1b1c19',
  'on-surface-variant': '#4c4732',
  'inverse-surface': '#30312d',
  'inverse-on-surface': '#f2f1eb',
  outline: '#7e775f',
  'outline-variant': '#cfc6ab',
  'surface-tint': '#6f5d00',
  primary: '#6f5d00',
  'on-primary': '#ffffff',
  'primary-container': '#f5d000',
  'on-primary-container': '#6a5900',
  'inverse-primary': '#dec666',
  secondary: '#4c6452',
  'on-secondary': '#ffffff',
  'secondary-container': '#cbe6d0',
  'on-secondary-container': '#506856',
  tertiary: '#5a605b',
  'on-tertiary': '#ffffff',
  'tertiary-container': '#ced4cd',
  'on-tertiary-container': '#555c56',
  error: '#ba1a1a',
  'on-error': '#ffffff',
  'error-container': '#ffdad6',
  'on-error-container': '#93000a',
  'primary-fixed': '#ffe167',
  'primary-fixed-dim': '#e7c400',
  'on-primary-fixed': '#221b00',
  'on-primary-fixed-variant': '#544600',
  'secondary-fixed': '#cee9d3',
  'secondary-fixed-dim': '#b2cdb7',
  'on-secondary-fixed': '#092012',
  'on-secondary-fixed-variant': '#354c3b',
  'tertiary-fixed': '#dee4dd',
  'tertiary-fixed-dim': '#c2c8c2',
  'on-tertiary-fixed': '#171d19',
  'on-tertiary-fixed-variant': '#424844',
  background: '#fbf9f3',
  'on-background': '#1b1c19',
  'surface-variant': '#e4e2dd',
} as const

export const typography = {
  'display-hero': {
    fontFamily: 'Newsreader',
    fontSize: '4.5rem',
    fontWeight: '400',
    lineHeight: '4.75rem',
    letterSpacing: '-0.025em',
  },
  'display-hero-mobile': {
    fontFamily: 'Newsreader',
    fontSize: '2.75rem',
    fontWeight: '400',
    lineHeight: '3rem',
    letterSpacing: '-0.02em',
  },
  'headline-lg': {
    fontFamily: 'Newsreader',
    fontSize: '3rem',
    fontWeight: '400',
    lineHeight: '3.5rem',
    letterSpacing: '-0.015em',
  },
  'headline-lg-mobile': {
    fontFamily: 'Newsreader',
    fontSize: '2rem',
    fontWeight: '400',
    lineHeight: '2.375rem',
    letterSpacing: '-0.01em',
  },
  'headline-md': {
    fontFamily: 'Newsreader',
    fontSize: '2rem',
    fontWeight: '500',
    lineHeight: '2.5rem',
    letterSpacing: '-0.01em',
  },
  'headline-sm': {
    fontFamily: 'Newsreader',
    fontSize: '1.375rem',
    fontWeight: '500',
    lineHeight: '1.875rem',
    letterSpacing: '0em',
  },
  'body-lg': {
    fontFamily: 'Newsreader',
    fontSize: '1.125rem',
    fontWeight: '400',
    lineHeight: '1.875rem',
    letterSpacing: '0.01em',
  },
  'body-md': {
    fontFamily: 'Newsreader',
    fontSize: '1rem',
    fontWeight: '400',
    lineHeight: '1.625rem',
    letterSpacing: '0em',
  },
  'body-sm': {
    fontFamily: 'Newsreader',
    fontSize: '0.875rem',
    fontWeight: '400',
    lineHeight: '1.375rem',
    letterSpacing: '0.01em',
  },
  'label-caps': {
    fontFamily: 'Space Mono',
    fontSize: '0.6875rem',
    fontWeight: '700',
    lineHeight: '1rem',
    letterSpacing: '0.12em',
  },
  'code-catalog': {
    fontFamily: 'Space Mono',
    fontSize: '0.8125rem',
    fontWeight: '700',
    lineHeight: '1.125rem',
    letterSpacing: '0.08em',
  },
  'label-metric': {
    fontFamily: 'Space Mono',
    fontSize: '0.75rem',
    fontWeight: '400',
    lineHeight: '1rem',
    letterSpacing: '0.04em',
  },
} as const

export const rounded = {
  sm: '0.5rem',
  DEFAULT: '1rem',
  md: '1.5rem',
  lg: '2rem',
  xl: '3rem',
  full: '9999px',
} as const

export const spacing = {
  gutter: '1.5rem',
  'gutter-desktop': '2.5rem',
  margin: '1.25rem',
  'margin-desktop': '3.5rem',
  'space-xs': '0.25rem',
  'space-sm': '0.5rem',
  'space-md': '1rem',
  'space-lg': '1.75rem',
  'space-xl': '3rem',
  'space-2xl': '5rem',
} as const

export const breakpoints = {
  mobileMax: 767,
  tabletMin: 768,
  tabletMax: 1023,
  desktopMin: 1024,
} as const

export type ColorToken = keyof typeof colors
export type TypographyToken = keyof typeof typography
export type RoundedToken = keyof typeof rounded
export type SpacingToken = keyof typeof spacing

