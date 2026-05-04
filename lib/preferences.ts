export type AppearanceMode = 'light' | 'dark' | 'system'
export type PaletteId = 'default' | 'jade' | 'study'
export type FontRole = 'body' | 'title' | 'code'
export type FontOptionId =
  | 'system-sans'
  | 'serif-current'
  | 'system-serif'
  | 'rounded-sans'
  | 'mono-system'
  | 'mono-readable'
export type TransitionLoaderMode = 'off' | 'random' | 'selected'
export type ReadingSize = 'compact' | 'comfortable' | 'large'
export type ReadingWidth = 'narrow' | 'standard' | 'wide'

export type FontPreferences = Record<FontRole, FontOptionId>

export type Preferences = {
  mode: AppearanceMode
  palette: PaletteId
  fonts: FontPreferences
  transitionLoader: {
    mode: TransitionLoaderMode
    selectedCurveId: string
  }
  reading: {
    size: ReadingSize
    width: ReadingWidth
  }
}

export const PREFERENCES_STORAGE_KEY = 'haerin-preferences-v1'

export const DEFAULT_PREFERENCES: Preferences = {
  mode: 'system',
  palette: 'default',
  fonts: {
    body: 'system-sans',
    title: 'serif-current',
    code: 'mono-system',
  },
  transitionLoader: {
    mode: 'random',
    selectedCurveId: 'original-thinking',
  },
  reading: {
    size: 'comfortable',
    width: 'standard',
  },
}

export const FONT_OPTIONS: Array<{
  id: FontOptionId
  label: string
  labelZh: string
  stack: string
  sample: string
}> = [
  {
    id: 'system-sans',
    label: 'System Sans',
    labelZh: '系统无衬线',
    stack: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', 'PingFang SC', 'Noto Sans SC', sans-serif",
    sample: 'Reading notes should feel light and steady.',
  },
  {
    id: 'serif-current',
    label: 'Crimson Serif',
    labelZh: '当前衬线',
    stack: "'Crimson Pro', Georgia, 'Times New Roman', 'Songti SC', serif",
    sample: 'A quiet title with a softer literary edge.',
  },
  {
    id: 'system-serif',
    label: 'System Serif',
    labelZh: '系统衬线',
    stack: "Georgia, 'Times New Roman', 'Songti SC', 'Noto Serif SC', serif",
    sample: 'Long essays gain a bookish cadence here.',
  },
  {
    id: 'rounded-sans',
    label: 'Rounded Sans',
    labelZh: '圆润无衬线',
    stack: "'SF Pro Rounded', 'Nunito Sans', 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif",
    sample: 'A friendlier shape for daily browsing.',
  },
  {
    id: 'mono-system',
    label: 'System Mono',
    labelZh: '系统等宽',
    stack: "'SF Mono', Monaco, 'Cascadia Code', 'JetBrains Mono', ui-monospace, monospace",
    sample: 'const note = await read();',
  },
  {
    id: 'mono-readable',
    label: 'Readable Mono',
    labelZh: '阅读等宽',
    stack: "'IBM Plex Mono', 'Cascadia Code', 'SF Mono', Consolas, ui-monospace, monospace",
    sample: 'Map<String, List<Post>> cache;',
  },
]

export const PALETTE_OPTIONS: Array<{
  id: PaletteId
  label: string
  labelZh: string
  swatch: string
}> = [
  { id: 'default', label: 'Default', labelZh: '默认', swatch: '#171717' },
  { id: 'jade', label: 'Jade', labelZh: '青玉', swatch: '#006C00' },
  { id: 'study', label: 'Study', labelZh: '书房', swatch: '#d89b2a' },
]

export const READING_SIZE_OPTIONS: Array<{
  id: ReadingSize
  label: string
  labelZh: string
  cssValue: string
}> = [
  { id: 'compact', label: 'Compact', labelZh: '紧凑', cssValue: '0.96rem' },
  { id: 'comfortable', label: 'Comfortable', labelZh: '舒适', cssValue: '1.06rem' },
  { id: 'large', label: 'Large', labelZh: '宽松', cssValue: '1.16rem' },
]

export const READING_WIDTH_OPTIONS: Array<{
  id: ReadingWidth
  label: string
  labelZh: string
  cssValue: string
}> = [
  { id: 'narrow', label: 'Narrow', labelZh: '窄栏', cssValue: '42rem' },
  { id: 'standard', label: 'Standard', labelZh: '标准', cssValue: '52rem' },
  { id: 'wide', label: 'Wide', labelZh: '宽栏', cssValue: '64rem' },
]

export function getFontStack(id: FontOptionId) {
  return FONT_OPTIONS.find((font) => font.id === id)?.stack ?? FONT_OPTIONS[0].stack
}

export function getReadingSizeValue(id: ReadingSize) {
  return READING_SIZE_OPTIONS.find((option) => option.id === id)?.cssValue ?? '1.06rem'
}

export function getReadingWidthValue(id: ReadingWidth) {
  return READING_WIDTH_OPTIONS.find((option) => option.id === id)?.cssValue ?? '52rem'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isOneOf<T extends string>(value: unknown, values: readonly T[]): value is T {
  return typeof value === 'string' && values.includes(value as T)
}

export function normalizePreferences(value: unknown): Preferences {
  if (!isRecord(value)) {
    return DEFAULT_PREFERENCES
  }

  const fonts = isRecord(value.fonts) ? value.fonts : {}
  const transitionLoader = isRecord(value.transitionLoader) ? value.transitionLoader : {}
  const reading = isRecord(value.reading) ? value.reading : {}

  return {
    mode: isOneOf(value.mode, ['light', 'dark', 'system']) ? value.mode : DEFAULT_PREFERENCES.mode,
    palette: isOneOf(value.palette, ['default', 'jade', 'study'])
      ? value.palette
      : DEFAULT_PREFERENCES.palette,
    fonts: {
      body: isOneOf(fonts.body, FONT_OPTIONS.map((font) => font.id))
        ? fonts.body
        : DEFAULT_PREFERENCES.fonts.body,
      title: isOneOf(fonts.title, FONT_OPTIONS.map((font) => font.id))
        ? fonts.title
        : DEFAULT_PREFERENCES.fonts.title,
      code: isOneOf(fonts.code, FONT_OPTIONS.map((font) => font.id))
        ? fonts.code
        : DEFAULT_PREFERENCES.fonts.code,
    },
    transitionLoader: {
      mode: isOneOf(transitionLoader.mode, ['off', 'random', 'selected'])
        ? transitionLoader.mode
        : DEFAULT_PREFERENCES.transitionLoader.mode,
      selectedCurveId:
        typeof transitionLoader.selectedCurveId === 'string'
          ? transitionLoader.selectedCurveId
          : DEFAULT_PREFERENCES.transitionLoader.selectedCurveId,
    },
    reading: {
      size: isOneOf(reading.size, ['compact', 'comfortable', 'large'])
        ? reading.size
        : DEFAULT_PREFERENCES.reading.size,
      width: isOneOf(reading.width, ['narrow', 'standard', 'wide'])
        ? reading.width
        : DEFAULT_PREFERENCES.reading.width,
    },
  }
}
