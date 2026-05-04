'use client'

import {
  Check,
  Monitor,
  Moon,
  RotateCcw,
  Settings2,
  Shuffle,
  Sparkles,
  Sun,
  Type,
} from 'lucide-react'
import MathCurveLoader from '@/components/MathCurveLoader'
import { useLanguage } from '@/components/LanguageProvider'
import { usePreferences } from '@/components/ThemeProvider'
import {
  AppearanceMode,
  DEFAULT_PREFERENCES,
  FONT_OPTIONS,
  FontOptionId,
  FontRole,
  PALETTE_OPTIONS,
  READING_SIZE_OPTIONS,
  READING_WIDTH_OPTIONS,
  getFontStack,
} from '@/lib/preferences'
import { MATH_CURVE_LOADERS } from '@/lib/mathCurves'

const copy = {
  en: {
    kicker: 'Personal Studio',
    title: 'Shape the blog around the way you read',
    subtitle: 'Tune color, type, motion, and article rhythm. Everything stays in this browser.',
    theme: 'Color',
    mode: 'Mode',
    palette: 'Palette',
    fonts: 'Typography',
    fontsNote: 'Separate the page voice, title voice, and code voice.',
    body: 'Page',
    titleFont: 'Titles',
    code: 'Code',
    loaders: 'Loading Motion',
    loadersNote: 'Route transitions follow this choice across the site.',
    enabled: 'Enable loading motion',
    random: 'Randomize loaders',
    selected: 'Selected loader',
    reading: 'Reading',
    readingNote: 'Markdown articles use these reading controls.',
    size: 'Text size',
    width: 'Line width',
    preview: 'Live Preview',
    reset: 'Reset',
    current: 'Current setup',
    off: 'Off',
    randomState: 'Random',
    selectedState: 'Fixed',
    sampleTitle: 'Spring boot notes, softened for a long evening',
    sampleBody:
      'A comfortable theme should reduce glare without making the interface sleepy. Type, spacing, and motion all carry a little of that work.',
  },
  zh: {
    kicker: '个性化陈列室',
    title: '把博客调成适合你阅读的样子',
    subtitle: '颜色、字体、动效和文章节奏都会即时生效，并只保存在当前浏览器。',
    theme: '颜色',
    mode: '模式',
    palette: '调色板',
    fonts: '字体',
    fontsNote: '页面、标题、代码块分别选择字体气质。',
    body: '页面',
    titleFont: '标题',
    code: '代码',
    loaders: '加载动效',
    loadersNote: '站内路由切换会使用这里的设置。',
    enabled: '开启加载动画',
    random: '随机加载动画',
    selected: '指定加载动画',
    reading: '阅读',
    readingNote: 'Markdown 文章会使用这些阅读设置。',
    size: '字号',
    width: '行宽',
    preview: '即时预览',
    reset: '恢复默认',
    current: '当前设置',
    off: '关闭',
    randomState: '随机',
    selectedState: '固定',
    sampleTitle: '把 Spring Boot 笔记调成适合夜晚长读的样子',
    sampleBody:
      '舒服的主题应该降低眩光，但不能让界面失去精神。字体、间距和动效都会一起参与这件事。',
  },
}

const modeOptions: Array<{ id: AppearanceMode; icon: typeof Sun; label: string; labelZh: string }> = [
  { id: 'light', icon: Sun, label: 'Light', labelZh: '浅色' },
  { id: 'dark', icon: Moon, label: 'Dark', labelZh: '深色' },
  { id: 'system', icon: Monitor, label: 'System', labelZh: '系统' },
]

const fontRoles: Array<{ id: FontRole; labelKey: 'body' | 'titleFont' | 'code' }> = [
  { id: 'body', labelKey: 'body' },
  { id: 'title', labelKey: 'titleFont' },
  { id: 'code', labelKey: 'code' },
]

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export default function PreferencesClient() {
  const { language } = useLanguage()
  const text = copy[language]
  const { preferences, actualTheme, setPreferences, resetPreferences } = usePreferences()
  const loaderEnabled = preferences.transitionLoader.mode !== 'off'
  const loaderRandom = preferences.transitionLoader.mode === 'random'
  const selectedCurve =
    MATH_CURVE_LOADERS.find((curve) => curve.id === preferences.transitionLoader.selectedCurveId) ??
    MATH_CURVE_LOADERS[0]

  const setFont = (role: FontRole, fontId: FontOptionId) => {
    setPreferences((current) => ({
      ...current,
      fonts: {
        ...current.fonts,
        [role]: fontId,
      },
    }))
  }

  return (
    <div className="preferences-page min-h-screen px-4 pb-24 pt-32 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <section className="preferences-hero">
          <div>
            <p className="preferences-kicker">{text.kicker}</p>
            <h1 className="preferences-title">{text.title}</h1>
            <p className="preferences-subtitle">{text.subtitle}</p>
          </div>

          <button
            type="button"
            onClick={(event) => resetPreferences(event)}
            className="preferences-reset"
          >
            <RotateCcw className="h-4 w-4" />
            <span>{text.reset}</span>
          </button>
        </section>

        <div className="preferences-layout">
          <div className="preferences-controls">
            <section className="preferences-panel">
              <div className="preferences-panel-head">
                <Sparkles className="h-5 w-5" />
                <div>
                  <h2>{text.theme}</h2>
                  <p>{actualTheme === 'dark' ? 'Dark surface' : 'Light surface'}</p>
                </div>
              </div>

              <div className="preferences-field">
                <p className="preferences-label">{text.mode}</p>
                <div className="preferences-segment">
                  {modeOptions.map((option) => {
                    const Icon = option.icon
                    const active = preferences.mode === option.id

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={(event) =>
                          setPreferences((current) => ({ ...current, mode: option.id }), event)
                        }
                        className={cx('preferences-segment-btn', active && 'is-active')}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{language === 'zh' ? option.labelZh : option.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="preferences-field">
                <p className="preferences-label">{text.palette}</p>
                <div className="preferences-palette-grid">
                  {PALETTE_OPTIONS.map((palette) => {
                    const active = preferences.palette === palette.id

                    return (
                      <button
                        key={palette.id}
                        type="button"
                        onClick={() =>
                          setPreferences((current) => ({ ...current, palette: palette.id }))
                        }
                        className={cx('preferences-palette-btn', active && 'is-active')}
                      >
                        <span
                          className="preferences-swatch"
                          style={{ backgroundColor: palette.swatch }}
                        />
                        <span>{language === 'zh' ? palette.labelZh : palette.label}</span>
                        {active && <Check className="ml-auto h-4 w-4" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            </section>

            <section className="preferences-panel">
              <div className="preferences-panel-head">
                <Type className="h-5 w-5" />
                <div>
                  <h2>{text.fonts}</h2>
                  <p>{text.fontsNote}</p>
                </div>
              </div>

              {fontRoles.map((role) => (
                <div key={role.id} className="preferences-field">
                  <p className="preferences-label">{text[role.labelKey]}</p>
                  <div className="preferences-font-grid">
                    {FONT_OPTIONS.map((font) => {
                      const active = preferences.fonts[role.id] === font.id

                      return (
                        <button
                          key={`${role.id}-${font.id}`}
                          type="button"
                          onClick={() => setFont(role.id, font.id)}
                          className={cx('preferences-font-btn', active && 'is-active')}
                          style={{ fontFamily: font.stack }}
                        >
                          <span>{language === 'zh' ? font.labelZh : font.label}</span>
                          <small>{font.sample}</small>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </section>

            <section className="preferences-panel">
              <div className="preferences-panel-head">
                <Shuffle className="h-5 w-5" />
                <div>
                  <h2>{text.loaders}</h2>
                  <p>{text.loadersNote}</p>
                </div>
              </div>

              <div className="preferences-toggle-row">
                <button
                  type="button"
                  onClick={() =>
                    setPreferences((current) => ({
                      ...current,
                      transitionLoader: {
                        ...current.transitionLoader,
                        mode: loaderEnabled ? 'off' : 'random',
                      },
                    }))
                  }
                  className={cx('preferences-switch', loaderEnabled && 'is-on')}
                  aria-pressed={loaderEnabled}
                >
                  <span />
                </button>
                <p>{text.enabled}</p>
              </div>

              {loaderEnabled && (
                <div className="preferences-toggle-row">
                  <button
                    type="button"
                    onClick={() =>
                      setPreferences((current) => ({
                        ...current,
                        transitionLoader: {
                          ...current.transitionLoader,
                          mode: loaderRandom ? 'selected' : 'random',
                        },
                      }))
                    }
                    className={cx('preferences-switch', loaderRandom && 'is-on')}
                    aria-pressed={loaderRandom}
                  >
                    <span />
                  </button>
                  <p>{text.random}</p>
                </div>
              )}

              {loaderEnabled && !loaderRandom && (
                <div className="preferences-field">
                  <p className="preferences-label">{text.selected}</p>
                  <div className="preferences-loader-grid">
                    {MATH_CURVE_LOADERS.map((curve) => {
                      const active = preferences.transitionLoader.selectedCurveId === curve.id

                      return (
                        <button
                          key={curve.id}
                          type="button"
                          onClick={() =>
                            setPreferences((current) => ({
                              ...current,
                              transitionLoader: {
                                mode: 'selected',
                                selectedCurveId: curve.id,
                              },
                            }))
                          }
                          className={cx('preferences-loader-btn', active && 'is-active')}
                        >
                          <MathCurveLoader
                            curve={curve}
                            className="h-16 w-16"
                            particleMode="compact"
                            strokeOpacity={active ? 0.2 : 0.12}
                          />
                          <span>{curve.name[language]}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </section>

            <section className="preferences-panel">
              <div className="preferences-panel-head">
                <Settings2 className="h-5 w-5" />
                <div>
                  <h2>{text.reading}</h2>
                  <p>{text.readingNote}</p>
                </div>
              </div>

              <div className="preferences-field">
                <p className="preferences-label">{text.size}</p>
                <div className="preferences-segment">
                  {READING_SIZE_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() =>
                        setPreferences((current) => ({
                          ...current,
                          reading: { ...current.reading, size: option.id },
                        }))
                      }
                      className={cx(
                        'preferences-segment-btn',
                        preferences.reading.size === option.id && 'is-active',
                      )}
                    >
                      <span>{language === 'zh' ? option.labelZh : option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="preferences-field">
                <p className="preferences-label">{text.width}</p>
                <div className="preferences-segment">
                  {READING_WIDTH_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() =>
                        setPreferences((current) => ({
                          ...current,
                          reading: { ...current.reading, width: option.id },
                        }))
                      }
                      className={cx(
                        'preferences-segment-btn',
                        preferences.reading.width === option.id && 'is-active',
                      )}
                    >
                      <span>{language === 'zh' ? option.labelZh : option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <aside className="preferences-preview-wrap">
            <div className="preferences-preview">
              <p className="preferences-kicker">{text.preview}</p>
              <h2 style={{ fontFamily: getFontStack(preferences.fonts.title) }}>
                {text.sampleTitle}
              </h2>
              <p style={{ fontFamily: getFontStack(preferences.fonts.body) }}>{text.sampleBody}</p>
              <pre style={{ fontFamily: getFontStack(preferences.fonts.code) }}>
                <code>{'const theme = preferences.palette\nrender(<Article />)'}</code>
              </pre>

              <div className="preferences-preview-loader">
                {loaderEnabled ? (
                  <MathCurveLoader
                    curve={selectedCurve}
                    className="h-24 w-24"
                    particleMode="compact"
                    strokeOpacity={0.16}
                  />
                ) : (
                  <span>{text.off}</span>
                )}
              </div>

              <div className="preferences-summary">
                <p>{text.current}</p>
                <span>{preferences.palette}</span>
                <span>{preferences.mode}</span>
                <span>
                  {preferences.transitionLoader.mode === 'off'
                    ? text.off
                    : preferences.transitionLoader.mode === 'random'
                      ? text.randomState
                      : text.selectedState}
                </span>
              </div>
            </div>

            <div className="preferences-reading-sheet">
              <article className="prose">
                <h2>{text.sampleTitle}</h2>
                <p>{text.sampleBody}</p>
                <blockquote>{language === 'zh' ? '真正舒服的设置，是你忘了它存在。' : 'The best settings disappear while you read.'}</blockquote>
              </article>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
