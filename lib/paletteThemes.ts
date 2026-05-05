export const CORE_PALETTE_IDS = ['default', 'jade', 'study'] as const
export const HAPPY_HUES_PALETTE_IDS = [
  'happy-hues-1',
  'happy-hues-2',
  'happy-hues-3',
  'happy-hues-4',
  'happy-hues-5',
  'happy-hues-6',
  'happy-hues-7',
  'happy-hues-8',
  'happy-hues-9',
  'happy-hues-10',
  'happy-hues-11',
  'happy-hues-12',
  'happy-hues-13',
  'happy-hues-14',
  'happy-hues-15',
  'happy-hues-16',
  'happy-hues-17',
] as const

export type CorePaletteId = (typeof CORE_PALETTE_IDS)[number]
export type HappyHuesPaletteId = (typeof HAPPY_HUES_PALETTE_IDS)[number]
export type PaletteId = CorePaletteId | HappyHuesPaletteId
export type PaletteFamily = 'core' | 'happy-hues'
export type PaletteThemeMode = 'light' | 'dark'

type GrayScaleKey = '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | '950'

export type GrayScale = Record<GrayScaleKey, string>

export type PaletteHeroRoles = {
  background: string
  headline: string
  paragraph: string
  button: string
  buttonText: string
}

export type PaletteCardRoles = {
  background: string
  headline: string
  subHeadline: string
  cardBackground: string
  cardHeading: string
  cardParagraph: string
}

export type PaletteFooterRoles = {
  background: string
  headline: string
  paragraph: string
  links: string
}

export type PaletteOption = {
  id: PaletteId
  family: PaletteFamily
  label: string
  labelZh: string
  shortLabel: string
  shortLabelZh: string
  swatches: [string, string, string, string, string]
  hero: PaletteHeroRoles
  cards: PaletteCardRoles
  footer: PaletteFooterRoles
}

export type PaletteThemeTokens = {
  bgPrimary: string
  bgSecondary: string
  surfacePrimary: string
  surfaceSecondary: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  borderColor: string
  accent: string
  accentSoft: string
  accentText: string
  twWhite: string
  twBlack: string
  gray: GrayScale
}

const CORE_PALETTES = [
  {
    id: 'default',
    family: 'core',
    label: 'Default',
    labelZh: '默认',
    shortLabel: 'DF',
    shortLabelZh: '默认',
    swatches: ['#ffffff', '#171717', '#fafafa', '#f5f5f5', '#171717'],
    hero: {
      background: '#ffffff',
      headline: '#171717',
      paragraph: '#525252',
      button: '#171717',
      buttonText: '#ffffff',
    },
    cards: {
      background: '#fafafa',
      headline: '#171717',
      subHeadline: '#525252',
      cardBackground: '#ffffff',
      cardHeading: '#171717',
      cardParagraph: '#525252',
    },
    footer: {
      background: '#ffffff',
      headline: '#171717',
      paragraph: '#525252',
      links: '#171717',
    },
  },
  {
    id: 'jade',
    family: 'core',
    label: 'Jade',
    labelZh: '青玉',
    shortLabel: 'JD',
    shortLabelZh: '青玉',
    swatches: ['#f1ede0', '#006c00', '#ece5d0', '#faf6e9', '#1a1a12'],
    hero: {
      background: '#f1ede0',
      headline: '#1a1a12',
      paragraph: '#3d3a30',
      button: '#006c00',
      buttonText: '#f4eed9',
    },
    cards: {
      background: '#ece5d0',
      headline: '#1a1a12',
      subHeadline: '#3d3a30',
      cardBackground: '#faf6e9',
      cardHeading: '#1a1a12',
      cardParagraph: '#3d3a30',
    },
    footer: {
      background: '#f1ede0',
      headline: '#1a1a12',
      paragraph: '#3d3a30',
      links: '#006c00',
    },
  },
  {
    id: 'study',
    family: 'core',
    label: 'Study',
    labelZh: '书房',
    shortLabel: 'SY',
    shortLabelZh: '书房',
    swatches: ['#fff8e8', '#d89b2a', '#ffedc4', '#fffaf0', '#1a1810'],
    hero: {
      background: '#fff8e8',
      headline: '#1a1810',
      paragraph: '#3d3a2a',
      button: '#d89b2a',
      buttonText: '#fff4d8',
    },
    cards: {
      background: '#ffedc4',
      headline: '#1a1810',
      subHeadline: '#3d3a2a',
      cardBackground: '#fffaf0',
      cardHeading: '#1a1810',
      cardParagraph: '#3d3a2a',
    },
    footer: {
      background: '#fff8e8',
      headline: '#1a1810',
      paragraph: '#3d3a2a',
      links: '#d89b2a',
    },
  },
] as const satisfies readonly PaletteOption[]

const HAPPY_HUES_PALETTES = [
  {
    id: 'happy-hues-1',
    family: 'happy-hues',
    label: 'Palette 01',
    labelZh: '配色 01',
    shortLabel: '01',
    shortLabelZh: '01',
    swatches: ['#fffffe', '#4fc4cf', '#f6efef', '#f0e2e1', '#181818'],
    hero: {
      background: '#fffffe',
      headline: '#181818',
      paragraph: '#2e2e2e',
      button: '#4fc4cf',
      buttonText: '#181818',
    },
    cards: {
      background: '#f6efef',
      headline: '#181818',
      subHeadline: '#2e2e2e',
      cardBackground: '#f0e2e1',
      cardHeading: '#181818',
      cardParagraph: '#2e2e2e',
    },
    footer: {
      background: '#fffffe',
      headline: '#181818',
      paragraph: '#2e2e2e',
      links: '#4fc4cf',
    },
  },
  {
    id: 'happy-hues-2',
    family: 'happy-hues',
    label: 'Palette 02',
    labelZh: '配色 02',
    shortLabel: '02',
    shortLabelZh: '02',
    swatches: ['#fffffe', '#00ebc7', '#f2f4f6', '#fffffe', '#00214d'],
    hero: {
      background: '#fffffe',
      headline: '#00214d',
      paragraph: '#1b2d45',
      button: '#00ebc7',
      buttonText: '#00214d',
    },
    cards: {
      background: '#f2f4f6',
      headline: '#00214d',
      subHeadline: '#1b2d45',
      cardBackground: '#fffffe',
      cardHeading: '#00214d',
      cardParagraph: '#1b2d45',
    },
    footer: {
      background: '#fffffe',
      headline: '#00214d',
      paragraph: '#1b2d45',
      links: '#00ebc7',
    },
  },
  {
    id: 'happy-hues-3',
    family: 'happy-hues',
    label: 'Palette 03',
    labelZh: '配色 03',
    shortLabel: '03',
    shortLabelZh: '03',
    swatches: ['#fffffe', '#3da9fc', '#d8eefe', '#fffffe', '#094067'],
    hero: {
      background: '#fffffe',
      headline: '#094067',
      paragraph: '#5f6c7b',
      button: '#3da9fc',
      buttonText: '#fffffe',
    },
    cards: {
      background: '#d8eefe',
      headline: '#094067',
      subHeadline: '#5f6c7b',
      cardBackground: '#fffffe',
      cardHeading: '#094067',
      cardParagraph: '#5f6c7b',
    },
    footer: {
      background: '#fffffe',
      headline: '#094067',
      paragraph: '#5f6c7b',
      links: '#3da9fc',
    },
  },
  {
    id: 'happy-hues-4',
    family: 'happy-hues',
    label: 'Palette 04',
    labelZh: '配色 04',
    shortLabel: '04',
    shortLabelZh: '04',
    swatches: ['#16161a', '#7f5af0', '#242629', '#16161a', '#fffffe'],
    hero: {
      background: '#16161a',
      headline: '#fffffe',
      paragraph: '#94a1b2',
      button: '#7f5af0',
      buttonText: '#fffffe',
    },
    cards: {
      background: '#242629',
      headline: '#fffffe',
      subHeadline: '#94a1b2',
      cardBackground: '#16161a',
      cardHeading: '#fffffe',
      cardParagraph: '#94a1b2',
    },
    footer: {
      background: '#16161a',
      headline: '#fffffe',
      paragraph: '#94a1b2',
      links: '#7f5af0',
    },
  },
  {
    id: 'happy-hues-5',
    family: 'happy-hues',
    label: 'Palette 05',
    labelZh: '配色 05',
    shortLabel: '05',
    shortLabelZh: '05',
    swatches: ['#f2f7f5', '#faae2b', '#00473e', '#f2f7f5', '#00473e'],
    hero: {
      background: '#f2f7f5',
      headline: '#00473e',
      paragraph: '#475d5b',
      button: '#faae2b',
      buttonText: '#00473e',
    },
    cards: {
      background: '#00473e',
      headline: '#fffffe',
      subHeadline: '#f2f7f5',
      cardBackground: '#f2f7f5',
      cardHeading: '#00473e',
      cardParagraph: '#475d5b',
    },
    footer: {
      background: '#f2f7f5',
      headline: '#00473e',
      paragraph: '#475d5b',
      links: '#faae2b',
    },
  },
  {
    id: 'happy-hues-6',
    family: 'happy-hues',
    label: 'Palette 06',
    labelZh: '配色 06',
    shortLabel: '06',
    shortLabelZh: '06',
    swatches: ['#fffffe', '#6246ea', '#fffffe', '#d1d1e9', '#2b2c34'],
    hero: {
      background: '#fffffe',
      headline: '#2b2c34',
      paragraph: '#2b2c34',
      button: '#6246ea',
      buttonText: '#fffffe',
    },
    cards: {
      background: '#fffffe',
      headline: '#2b2c34',
      subHeadline: '#2b2c34',
      cardBackground: '#d1d1e9',
      cardHeading: '#2b2c34',
      cardParagraph: '#2b2c34',
    },
    footer: {
      background: '#fffffe',
      headline: '#2b2c34',
      paragraph: '#2b2c34',
      links: '#6246ea',
    },
  },
  {
    id: 'happy-hues-7',
    family: 'happy-hues',
    label: 'Palette 07',
    labelZh: '配色 07',
    shortLabel: '07',
    shortLabelZh: '07',
    swatches: ['#fec7d7', '#0e172c', '#fffffe', '#d9d4e7', '#0e172c'],
    hero: {
      background: '#fec7d7',
      headline: '#0e172c',
      paragraph: '#0e172c',
      button: '#0e172c',
      buttonText: '#fffffe',
    },
    cards: {
      background: '#fffffe',
      headline: '#0e172c',
      subHeadline: '#0e172c',
      cardBackground: '#d9d4e7',
      cardHeading: '#0e172c',
      cardParagraph: '#0e172c',
    },
    footer: {
      background: '#fec7d7',
      headline: '#0e172c',
      paragraph: '#0e172c',
      links: '#fec7d7',
    },
  },
  {
    id: 'happy-hues-8',
    family: 'happy-hues',
    label: 'Palette 08',
    labelZh: '配色 08',
    shortLabel: '08',
    shortLabelZh: '08',
    swatches: ['#f8f5f2', '#078080', '#fffffe', '#f8f5f2', '#232323'],
    hero: {
      background: '#f8f5f2',
      headline: '#232323',
      paragraph: '#222525',
      button: '#078080',
      buttonText: '#232323',
    },
    cards: {
      background: '#fffffe',
      headline: '#232323',
      subHeadline: '#222525',
      cardBackground: '#f8f5f2',
      cardHeading: '#232323',
      cardParagraph: '#222525',
    },
    footer: {
      background: '#f8f5f2',
      headline: '#232323',
      paragraph: '#222525',
      links: '#078080',
    },
  },
  {
    id: 'happy-hues-9',
    family: 'happy-hues',
    label: 'Palette 09',
    labelZh: '配色 09',
    shortLabel: '09',
    shortLabelZh: '09',
    swatches: ['#eff0f3', '#ff8e3c', '#fffffe', '#eff0f3', '#0d0d0d'],
    hero: {
      background: '#eff0f3',
      headline: '#0d0d0d',
      paragraph: '#2a2a2a',
      button: '#ff8e3c',
      buttonText: '#0d0d0d',
    },
    cards: {
      background: '#fffffe',
      headline: '#0d0d0d',
      subHeadline: '#2a2a2a',
      cardBackground: '#eff0f3',
      cardHeading: '#0d0d0d',
      cardParagraph: '#2a2a2a',
    },
    footer: {
      background: '#eff0f3',
      headline: '#0d0d0d',
      paragraph: '#2a2a2a',
      links: '#ff8e3c',
    },
  },
  {
    id: 'happy-hues-10',
    family: 'happy-hues',
    label: 'Palette 10',
    labelZh: '配色 10',
    shortLabel: '10',
    shortLabelZh: '10',
    swatches: ['#004643', '#f9bc60', '#abd1c6', '#004643', '#fffffe'],
    hero: {
      background: '#004643',
      headline: '#fffffe',
      paragraph: '#abd1c6',
      button: '#f9bc60',
      buttonText: '#001e1d',
    },
    cards: {
      background: '#abd1c6',
      headline: '#001e1d',
      subHeadline: '#0f3433',
      cardBackground: '#004643',
      cardHeading: '#fffffe',
      cardParagraph: '#abd1c6',
    },
    footer: {
      background: '#004643',
      headline: '#fffffe',
      paragraph: '#abd1c6',
      links: '#f9bc60',
    },
  },
  {
    id: 'happy-hues-11',
    family: 'happy-hues',
    label: 'Palette 11',
    labelZh: '配色 11',
    shortLabel: '11',
    shortLabelZh: '11',
    swatches: ['#f9f4ef', '#8c7851', '#fffffe', '#eaddcf', '#020826'],
    hero: {
      background: '#f9f4ef',
      headline: '#020826',
      paragraph: '#716040',
      button: '#8c7851',
      buttonText: '#fffffe',
    },
    cards: {
      background: '#fffffe',
      headline: '#020826',
      subHeadline: '#716040',
      cardBackground: '#eaddcf',
      cardHeading: '#020826',
      cardParagraph: '#716040',
    },
    footer: {
      background: '#f9f4ef',
      headline: '#020826',
      paragraph: '#716040',
      links: '#8c7851',
    },
  },
  {
    id: 'happy-hues-12',
    family: 'happy-hues',
    label: 'Palette 12',
    labelZh: '配色 12',
    shortLabel: '12',
    shortLabelZh: '12',
    swatches: ['#232946', '#eebbc3', '#d4d8f0', '#fffffe', '#fffffe'],
    hero: {
      background: '#232946',
      headline: '#fffffe',
      paragraph: '#b8c1ec',
      button: '#eebbc3',
      buttonText: '#232946',
    },
    cards: {
      background: '#d4d8f0',
      headline: '#232946',
      subHeadline: '#232946',
      cardBackground: '#fffffe',
      cardHeading: '#232946',
      cardParagraph: '#232946',
    },
    footer: {
      background: '#232946',
      headline: '#fffffe',
      paragraph: '#b8c1ec',
      links: '#eebbc3',
    },
  },
  {
    id: 'happy-hues-13',
    family: 'happy-hues',
    label: 'Palette 13',
    labelZh: '配色 13',
    shortLabel: '13',
    shortLabelZh: '13',
    swatches: ['#0f0e17', '#ff8906', '#fffffe', '#0f0e17', '#fffffe'],
    hero: {
      background: '#0f0e17',
      headline: '#fffffe',
      paragraph: '#a7a9be',
      button: '#ff8906',
      buttonText: '#fffffe',
    },
    cards: {
      background: '#fffffe',
      headline: '#0f0e17',
      subHeadline: '#2e2f3e',
      cardBackground: '#0f0e17',
      cardHeading: '#fffffe',
      cardParagraph: '#a7a9be',
    },
    footer: {
      background: '#0f0e17',
      headline: '#fffffe',
      paragraph: '#a7a9be',
      links: '#ff8906',
    },
  },
  {
    id: 'happy-hues-14',
    family: 'happy-hues',
    label: 'Palette 14',
    labelZh: '配色 14',
    shortLabel: '14',
    shortLabelZh: '14',
    swatches: ['#fffffe', '#ffd803', '#e3f6f5', '#fffffe', '#272343'],
    hero: {
      background: '#fffffe',
      headline: '#272343',
      paragraph: '#2d334a',
      button: '#ffd803',
      buttonText: '#272343',
    },
    cards: {
      background: '#e3f6f5',
      headline: '#272343',
      subHeadline: '#2d334a',
      cardBackground: '#fffffe',
      cardHeading: '#272343',
      cardParagraph: '#2d334a',
    },
    footer: {
      background: '#fffffe',
      headline: '#272343',
      paragraph: '#2d334a',
      links: '#ffd803',
    },
  },
  {
    id: 'happy-hues-15',
    family: 'happy-hues',
    label: 'Palette 15',
    labelZh: '配色 15',
    shortLabel: '15',
    shortLabelZh: '15',
    swatches: ['#faeee7', '#ff8ba7', '#fffffe', '#faeee7', '#33272a'],
    hero: {
      background: '#faeee7',
      headline: '#33272a',
      paragraph: '#594a4e',
      button: '#ff8ba7',
      buttonText: '#33272a',
    },
    cards: {
      background: '#fffffe',
      headline: '#33272a',
      subHeadline: '#594a4e',
      cardBackground: '#faeee7',
      cardHeading: '#33272a',
      cardParagraph: '#594a4e',
    },
    footer: {
      background: '#faeee7',
      headline: '#33272a',
      paragraph: '#594a4e',
      links: '#ff8ba7',
    },
  },
  {
    id: 'happy-hues-16',
    family: 'happy-hues',
    label: 'Palette 16',
    labelZh: '配色 16',
    shortLabel: '16',
    shortLabelZh: '16',
    swatches: ['#55423d', '#ffc0ad', '#271c19', '#55423d', '#fffffe'],
    hero: {
      background: '#55423d',
      headline: '#fffffe',
      paragraph: '#fff3ec',
      button: '#ffc0ad',
      buttonText: '#271c19',
    },
    cards: {
      background: '#271c19',
      headline: '#fffffe',
      subHeadline: '#fff3ec',
      cardBackground: '#55423d',
      cardHeading: '#fffffe',
      cardParagraph: '#fff3ec',
    },
    footer: {
      background: '#55423d',
      headline: '#fffffe',
      paragraph: '#fff3ec',
      links: '#e78fb3',
    },
  },
  {
    id: 'happy-hues-17',
    family: 'happy-hues',
    label: 'Palette 17',
    labelZh: '配色 17',
    shortLabel: '17',
    shortLabelZh: '17',
    swatches: ['#fef6e4', '#f582ae', '#f3d2c1', '#fef6e4', '#001858'],
    hero: {
      background: '#fef6e4',
      headline: '#001858',
      paragraph: '#172c66',
      button: '#f582ae',
      buttonText: '#001858',
    },
    cards: {
      background: '#f3d2c1',
      headline: '#001858',
      subHeadline: '#172c66',
      cardBackground: '#fef6e4',
      cardHeading: '#001858',
      cardParagraph: '#172c66',
    },
    footer: {
      background: '#fef6e4',
      headline: '#001858',
      paragraph: '#172c66',
      links: '#fef6e4',
    },
  },
] as const satisfies readonly PaletteOption[]

export const PALETTE_OPTIONS = [...CORE_PALETTES, ...HAPPY_HUES_PALETTES] as readonly PaletteOption[]
export const CORE_PALETTE_OPTIONS = CORE_PALETTES as readonly PaletteOption[]
export const HAPPY_HUES_PALETTE_OPTIONS = HAPPY_HUES_PALETTES as readonly PaletteOption[]
export const PALETTE_IDS = PALETTE_OPTIONS.map((palette) => palette.id) as PaletteId[]

const STATIC_THEME_TOKENS: Record<CorePaletteId, Record<PaletteThemeMode, PaletteThemeTokens>> = {
  default: {
    light: {
      bgPrimary: '#ffffff',
      bgSecondary: '#fafafa',
      surfacePrimary: '#ffffff',
      surfaceSecondary: '#f5f5f5',
      textPrimary: '#171717',
      textSecondary: '#525252',
      textMuted: '#737373',
      borderColor: '#e5e5e5',
      accent: '#171717',
      accentSoft: 'rgba(23, 23, 23, 0.08)',
      accentText: '#ffffff',
      twWhite: '#ffffff',
      twBlack: '#0a0a0a',
      gray: {
        '50': '#fafafa',
        '100': '#f5f5f5',
        '200': '#e5e5e5',
        '300': '#d4d4d4',
        '400': '#a3a3a3',
        '500': '#737373',
        '600': '#525252',
        '700': '#404040',
        '800': '#262626',
        '900': '#171717',
        '950': '#0a0a0a',
      },
    },
    dark: {
      bgPrimary: '#0a0a0a',
      bgSecondary: '#171717',
      surfacePrimary: '#111111',
      surfaceSecondary: '#1f1f1f',
      textPrimary: '#fafafa',
      textSecondary: '#a3a3a3',
      textMuted: '#737373',
      borderColor: '#262626',
      accent: '#fafafa',
      accentSoft: 'rgba(250, 250, 250, 0.1)',
      accentText: '#0a0a0a',
      twWhite: '#fafafa',
      twBlack: '#0a0a0a',
      gray: {
        '50': '#fafafa',
        '100': '#f5f5f5',
        '200': '#e5e5e5',
        '300': '#d4d4d4',
        '400': '#a3a3a3',
        '500': '#737373',
        '600': '#525252',
        '700': '#404040',
        '800': '#262626',
        '900': '#171717',
        '950': '#0a0a0a',
      },
    },
  },
  jade: {
    light: {
      bgPrimary: '#f1ede0',
      bgSecondary: '#ece5d0',
      surfacePrimary: '#faf6e9',
      surfaceSecondary: '#e8dfc9',
      textPrimary: '#1a1a12',
      textSecondary: '#3d3a30',
      textMuted: '#7a7565',
      borderColor: '#d9cfae',
      accent: '#006c00',
      accentSoft: 'rgba(0, 108, 0, 0.08)',
      accentText: '#f4eed9',
      twWhite: '#faf6e9',
      twBlack: '#1a1a12',
      gray: {
        '50': '#faf6e9',
        '100': '#f1ede0',
        '200': '#e8dfc9',
        '300': '#d9cfae',
        '400': '#b0a993',
        '500': '#7a7565',
        '600': '#575244',
        '700': '#3d3a30',
        '800': '#27261f',
        '900': '#1a1a12',
        '950': '#0c120a',
      },
    },
    dark: {
      bgPrimary: '#0c1a0e',
      bgSecondary: '#0f2311',
      surfacePrimary: '#123216',
      surfaceSecondary: '#183a1c',
      textPrimary: '#f4eed9',
      textSecondary: '#d9ceab',
      textMuted: '#8fa37f',
      borderColor: 'rgba(168, 133, 54, 0.25)',
      accent: '#b8f0b6',
      accentSoft: 'rgba(184, 240, 182, 0.1)',
      accentText: '#05160a',
      twWhite: '#f4eed9',
      twBlack: '#05160a',
      gray: {
        '50': '#f4eed9',
        '100': '#e2dabe',
        '200': '#cbc3a0',
        '300': '#a89a6e',
        '400': '#8fa37f',
        '500': '#687e5d',
        '600': '#4e6a52',
        '700': '#2a4a2e',
        '800': '#183a1c',
        '900': '#0f2311',
        '950': '#05160a',
      },
    },
  },
  study: {
    light: {
      bgPrimary: '#fff8e8',
      bgSecondary: '#ffedc4',
      surfacePrimary: '#fffaf0',
      surfaceSecondary: '#f7e8c4',
      textPrimary: '#1a1810',
      textSecondary: '#3d3a2a',
      textMuted: '#6f6a52',
      borderColor: '#f0d8a0',
      accent: '#d89b2a',
      accentSoft: 'rgba(216, 155, 42, 0.13)',
      accentText: '#fff4d8',
      twWhite: '#fffaf0',
      twBlack: '#1a1810',
      gray: {
        '50': '#fffaf0',
        '100': '#fff8e8',
        '200': '#f7e8c4',
        '300': '#f0d8a0',
        '400': '#c4ae7b',
        '500': '#6f6a52',
        '600': '#564e35',
        '700': '#3d3a2a',
        '800': '#272318',
        '900': '#1a1810',
        '950': '#0e0c08',
      },
    },
    dark: {
      bgPrimary: '#18140c',
      bgSecondary: '#211a0f',
      surfacePrimary: '#2a2112',
      surfaceSecondary: '#342916',
      textPrimary: '#fff4d8',
      textSecondary: '#e5d2a4',
      textMuted: '#b89b62',
      borderColor: 'rgba(216, 155, 42, 0.26)',
      accent: '#f1c15d',
      accentSoft: 'rgba(241, 193, 93, 0.12)',
      accentText: '#18140c',
      twWhite: '#fff4d8',
      twBlack: '#18140c',
      gray: {
        '50': '#fff4d8',
        '100': '#eedbb4',
        '200': '#e5d2a4',
        '300': '#c6ae7b',
        '400': '#b89b62',
        '500': '#8f7446',
        '600': '#6b5226',
        '700': '#493619',
        '800': '#342916',
        '900': '#211a0f',
        '950': '#18140c',
      },
    },
  },
}

const GRAY_STEPS: Array<[GrayScaleKey, number]> = [
  ['50', 0.02],
  ['100', 0.08],
  ['200', 0.16],
  ['300', 0.28],
  ['400', 0.42],
  ['500', 0.56],
  ['600', 0.68],
  ['700', 0.78],
  ['800', 0.88],
  ['900', 0.95],
  ['950', 0.985],
]

function normalizeHex(hex: string) {
  const safe = hex.trim().toLowerCase()
  if (safe === 'black') return '#000000'
  return safe
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function hexToRgb(hex: string) {
  const safe = normalizeHex(hex).replace('#', '')
  const normalized = safe.length === 3
    ? safe
        .split('')
        .map((chunk) => `${chunk}${chunk}`)
        .join('')
    : safe

  const value = Number.parseInt(normalized, 16)
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  }
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b]
    .map((value) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, '0'))
    .join('')}`
}

function mixHex(from: string, to: string, amount: number) {
  const start = hexToRgb(from)
  const end = hexToRgb(to)
  const ratio = clamp(amount, 0, 1)

  return rgbToHex(
    start.r + (end.r - start.r) * ratio,
    start.g + (end.g - start.g) * ratio,
    start.b + (end.b - start.b) * ratio,
  )
}

function withAlpha(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1)})`
}

function srgbToLinear(channel: number) {
  const value = channel / 255
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

function luminance(hex: string) {
  const { r, g, b } = hexToRgb(hex)
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b)
}

function contrastRatio(background: string, foreground: string) {
  const light = Math.max(luminance(background), luminance(foreground))
  const dark = Math.min(luminance(background), luminance(foreground))
  return (light + 0.05) / (dark + 0.05)
}

function pickReadableText(background: string, ...candidates: string[]) {
  const unique = [...new Set([...candidates, '#ffffff', '#101010'].map(normalizeHex))]

  return unique.reduce((best, current) => {
    return contrastRatio(background, current) > contrastRatio(background, best) ? current : best
  })
}

function buildGrayScale(lightest: string, darkest: string): GrayScale {
  return Object.fromEntries(
    GRAY_STEPS.map(([key, amount]) => [key, mixHex(lightest, darkest, amount)]),
  ) as GrayScale
}

function finalizeThemeTokens(
  mode: PaletteThemeMode,
  base: Omit<PaletteThemeTokens, 'twWhite' | 'twBlack' | 'gray'>,
) {
  const lightest = mode === 'dark'
    ? mixHex(base.textPrimary, '#ffffff', 0.08)
    : mixHex(base.bgPrimary, '#ffffff', 0.52)
  const darkest = mode === 'dark'
    ? mixHex(base.bgPrimary, '#000000', 0.38)
    : mixHex(base.textPrimary, '#000000', 0.28)
  const gray = buildGrayScale(lightest, darkest)

  return {
    ...base,
    twWhite: gray['50'],
    twBlack: gray['950'],
    gray,
  }
}

function buildHappyHuesThemeTokens(
  palette: PaletteOption,
  mode: PaletteThemeMode,
): PaletteThemeTokens {
  const sourceDark = luminance(palette.hero.background) < 0.45

  if (mode === 'light') {
    const bgPrimary = sourceDark
      ? mixHex(mixHex(palette.hero.background, '#ffffff', 0.92), palette.hero.button, 0.08)
      : palette.hero.background
    const bgSecondary = sourceDark
      ? mixHex(bgPrimary, palette.cards.background, 0.18)
      : mixHex(palette.hero.background, palette.cards.background, 0.42)
    const surfacePrimary = sourceDark
      ? mixHex(bgPrimary, palette.cards.cardBackground, 0.12)
      : palette.cards.cardBackground
    const surfaceSecondary = sourceDark
      ? mixHex(bgPrimary, palette.cards.background, 0.22)
      : luminance(palette.cards.background) < 0.32
        ? mixHex(palette.hero.background, palette.cards.background, 0.18)
        : palette.cards.background
    const textPrimary = sourceDark
      ? pickReadableText(bgPrimary, palette.hero.buttonText, palette.cards.headline, palette.hero.background)
      : palette.hero.headline
    const textSecondary = sourceDark
      ? mixHex(textPrimary, bgPrimary, 0.42)
      : palette.hero.paragraph
    const textMuted = mixHex(textSecondary, bgPrimary, 0.34)

    return finalizeThemeTokens('light', {
      bgPrimary,
      bgSecondary,
      surfacePrimary,
      surfaceSecondary,
      textPrimary,
      textSecondary,
      textMuted,
      borderColor: mixHex(textPrimary, bgPrimary, 0.78),
      accent: palette.hero.button,
      accentSoft: withAlpha(palette.hero.button, 0.13),
      accentText: pickReadableText(
        palette.hero.button,
        palette.hero.buttonText,
        textPrimary,
      ),
    })
  }

  const bgPrimary = sourceDark
    ? mixHex(palette.hero.background, '#050608', 0.18)
    : mixHex(mixHex(palette.hero.headline, '#050608', 0.72), palette.hero.button, 0.06)
  const bgSecondary = sourceDark
    ? mixHex(bgPrimary, palette.cards.background, 0.16)
    : mixHex(bgPrimary, palette.cards.background, 0.1)
  const surfacePrimary = sourceDark
    ? mixHex(bgPrimary, palette.cards.cardBackground, 0.2)
    : mixHex(bgPrimary, palette.cards.cardBackground, 0.16)
  const surfaceSecondary = mixHex(surfacePrimary, palette.cards.background, 0.08)
  const textPrimary = pickReadableText(
    bgPrimary,
    palette.hero.headline,
    palette.cards.cardHeading,
    palette.hero.buttonText,
  )
  const candidateSecondary = luminance(palette.hero.paragraph) > 0.55
    ? palette.hero.paragraph
    : mixHex(textPrimary, bgPrimary, 0.36)
  const textSecondary = pickReadableText(
    bgSecondary,
    candidateSecondary,
    palette.cards.cardParagraph,
    palette.cards.subHeadline,
  )
  const textMuted = mixHex(textSecondary, bgPrimary, 0.26)

  return finalizeThemeTokens('dark', {
    bgPrimary,
    bgSecondary,
    surfacePrimary,
    surfaceSecondary,
    textPrimary,
    textSecondary,
    textMuted,
    borderColor: mixHex(textPrimary, bgPrimary, 0.8),
    accent: palette.hero.button,
    accentSoft: withAlpha(palette.hero.button, 0.18),
    accentText: pickReadableText(
      palette.hero.button,
      palette.hero.buttonText,
      textPrimary,
    ),
  })
}

export function isPaletteId(value: unknown): value is PaletteId {
  return typeof value === 'string' && PALETTE_IDS.includes(value as PaletteId)
}

export function getPaletteOption(id: PaletteId) {
  return PALETTE_OPTIONS.find((palette) => palette.id === id) ?? PALETTE_OPTIONS[0]
}

export function getPaletteThemeTokens(id: PaletteId, mode: PaletteThemeMode) {
  if ((CORE_PALETTE_IDS as readonly string[]).includes(id)) {
    return STATIC_THEME_TOKENS[id as CorePaletteId][mode]
  }

  return buildHappyHuesThemeTokens(getPaletteOption(id), mode)
}

export function toRgbChannels(hex: string) {
  const { r, g, b } = hexToRgb(hex)
  return `${r} ${g} ${b}`
}
