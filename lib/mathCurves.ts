export type SupportedLanguage = 'en' | 'zh'

type LocalizedText = Record<SupportedLanguage, string>

export interface MathCurveConfig {
  id: string
  name: LocalizedText
  tag: LocalizedText
  description: LocalizedText
  formula: string[]
  rotate: boolean
  particleCount: number
  trailSpan: number
  durationMs: number
  rotationDurationMs: number
  pulseDurationMs: number
  strokeWidth: number
  heartWaveB?: number
  point: (progress: number, detailScale: number, config: MathCurveConfig) => { x: number; y: number }
}

export const MATH_CURVE_LOADERS: MathCurveConfig[] = [
  {
    id: 'original-thinking',
    name: {
      en: 'Original Thinking',
      zh: '原始思路',
    },
    tag: {
      en: 'Custom Rose Trail',
      zh: '自定义玫瑰尾迹',
    },
    description: {
      en: 'A sevenfold cosine term cuts into the base circle, so the trail blooms into a rotating seven-petal ring.',
      zh: '在基础圆周里嵌入 7 倍频余弦项后，轨迹会长成一个持续旋转的七瓣花环。',
    },
    formula: [
      'x(t) = 50 + (7 cos t - 3s cos 7t) * 3.9',
      'y(t) = 50 + (7 sin t - 3s sin 7t) * 3.9',
      's = detailScale(time)',
    ],
    rotate: true,
    particleCount: 64,
    trailSpan: 0.38,
    durationMs: 4600,
    rotationDurationMs: 28000,
    pulseDurationMs: 4200,
    strokeWidth: 5.5,
    point(progress, detailScale) {
      const t = progress * Math.PI * 2
      const x = 7 * Math.cos(t) - 3 * detailScale * Math.cos(7 * t)
      const y = 7 * Math.sin(t) - 3 * detailScale * Math.sin(7 * t)
      return {
        x: 50 + x * 3.9,
        y: 50 + y * 3.9,
      }
    },
  },
  {
    id: 'thinking-five',
    name: {
      en: 'Thinking Five',
      zh: '五瓣思路',
    },
    tag: {
      en: 'Custom Rose Trail',
      zh: '自定义玫瑰尾迹',
    },
    description: {
      en: 'Replacing the sevenfold term with a fivefold one removes some inner loops and leaves a cleaner five-petal cadence.',
      zh: '把 7 倍频项换成 5 倍频后，内部小回环会减少，节奏变成更清爽的五瓣结构。',
    },
    formula: [
      'x(t) = 50 + (7 cos t - 3s cos 5t) * 3.9',
      'y(t) = 50 + (7 sin t - 3s sin 5t) * 3.9',
      's = detailScale(time)',
    ],
    rotate: true,
    particleCount: 62,
    trailSpan: 0.38,
    durationMs: 4600,
    rotationDurationMs: 28000,
    pulseDurationMs: 4200,
    strokeWidth: 5.5,
    point(progress, detailScale) {
      const t = progress * Math.PI * 2
      const x = 7 * Math.cos(t) - 3 * detailScale * Math.cos(5 * t)
      const y = 7 * Math.sin(t) - 3 * detailScale * Math.sin(5 * t)
      return {
        x: 50 + x * 3.9,
        y: 50 + y * 3.9,
      }
    },
  },
  {
    id: 'rose-orbit',
    name: {
      en: 'Rose Orbit',
      zh: '玫瑰轨道',
    },
    tag: {
      en: 'r = cos(kθ)',
      zh: 'r = cos(kθ)',
    },
    description: {
      en: 'The radius breathes with cos(7t), so the orbit repeatedly petals outward while staying locked to a circle.',
      zh: '半径跟着 cos(7t) 呼吸变化，因此轨迹会沿圆周反复鼓出花瓣，同时保持绕圈的稳定感。',
    },
    formula: [
      'r(t) = 7 - 2.7s cos(7t)',
      'x(t) = 50 + cos t · r(t) · 3.9',
      'y(t) = 50 + sin t · r(t) · 3.9',
    ],
    rotate: true,
    particleCount: 72,
    trailSpan: 0.42,
    durationMs: 5200,
    rotationDurationMs: 28000,
    pulseDurationMs: 4600,
    strokeWidth: 5.2,
    point(progress, detailScale) {
      const t = progress * Math.PI * 2
      const r = 7 - 2.7 * detailScale * Math.cos(7 * t)
      return {
        x: 50 + Math.cos(t) * r * 3.9,
        y: 50 + Math.sin(t) * r * 3.9,
      }
    },
  },
  {
    id: 'rose-curve',
    name: {
      en: 'Rose Curve',
      zh: '玫瑰曲线',
    },
    tag: {
      en: 'r = a cos(kθ)',
      zh: 'r = a cos(kθ)',
    },
    description: {
      en: 'Using r = a cos(5t) produces five evenly spaced lobes, and the breathing multiplier makes each petal swell softly.',
      zh: '使用 r = a cos(5t) 会得到均匀分布的五瓣结构，再叠加呼吸倍率后，每片花瓣都会轻微胀缩。',
    },
    formula: [
      'r(t) = a(0.72 + 0.28s) cos(5t)',
      'a = 9.2 + 0.6s',
      'x(t) = 50 + cos t · r(t) · 3.25',
      'y(t) = 50 + sin t · r(t) · 3.25',
    ],
    rotate: true,
    particleCount: 78,
    trailSpan: 0.32,
    durationMs: 5400,
    rotationDurationMs: 28000,
    pulseDurationMs: 4600,
    strokeWidth: 4.5,
    point(progress, detailScale) {
      const t = progress * Math.PI * 2
      const a = 9.2 + detailScale * 0.6
      const r = a * (0.72 + detailScale * 0.28) * Math.cos(5 * t)
      return {
        x: 50 + Math.cos(t) * r * 3.25,
        y: 50 + Math.sin(t) * r * 3.25,
      }
    },
  },
  {
    id: 'lissajous-drift',
    name: {
      en: 'Lissajous Drift',
      zh: '李萨如漂移',
    },
    tag: {
      en: 'x = sin(at), y = sin(bt)',
      zh: 'x = sin(at), y = sin(bt)',
    },
    description: {
      en: 'Different sine frequencies on x and y make the trail cross itself like an oscilloscope weaving signal.',
      zh: 'x 和 y 轴使用不同频率的正弦后，路径会不断交叉回绕，看起来像示波器里的编织波形。',
    },
    formula: [
      'A = 24 + 6s',
      'x(t) = 50 + sin(3t + π/2) · A',
      'y(t) = 50 + sin(4t) · 0.92A',
    ],
    rotate: false,
    particleCount: 68,
    trailSpan: 0.34,
    durationMs: 6000,
    rotationDurationMs: 36000,
    pulseDurationMs: 5400,
    strokeWidth: 4.7,
    point(progress, detailScale) {
      const t = progress * Math.PI * 2
      const amp = 24 + detailScale * 6
      return {
        x: 50 + Math.sin(3 * t + Math.PI / 2) * amp,
        y: 50 + Math.sin(4 * t) * (amp * 0.92),
      }
    },
  },
  {
    id: 'lemniscate-bloom',
    name: {
      en: 'Lemniscate Bloom',
      zh: '双纽花开',
    },
    tag: {
      en: 'Bernoulli Lemniscate',
      zh: '伯努利双纽线',
    },
    description: {
      en: 'The 1 + sin²t denominator pinches the center and preserves two lobes, so it reads as a breathing infinity sign.',
      zh: '分母里的 1 + sin²t 会把中心收紧并保留双环，因此它天然像一个正在呼吸的无限符号。',
    },
    formula: [
      'a = 20 + 7s',
      'x(t) = 50 + a cos t / (1 + sin² t)',
      'y(t) = 50 + a sin t cos t / (1 + sin² t)',
    ],
    rotate: false,
    particleCount: 70,
    trailSpan: 0.4,
    durationMs: 5600,
    rotationDurationMs: 34000,
    pulseDurationMs: 5000,
    strokeWidth: 4.8,
    point(progress, detailScale) {
      const t = progress * Math.PI * 2
      const scale = 20 + detailScale * 7
      const denom = 1 + Math.sin(t) ** 2
      return {
        x: 50 + (scale * Math.cos(t)) / denom,
        y: 50 + (scale * Math.sin(t) * Math.cos(t)) / denom,
      }
    },
  },
  {
    id: 'hypotrochoid-loop',
    name: {
      en: 'Hypotrochoid Loop',
      zh: '内旋轮回环',
    },
    tag: {
      en: 'Inner Spirograph',
      zh: '内旋轮线',
    },
    description: {
      en: 'Rolling-circle terms stack nested turns and offsets, making the trace feel like a compact machine-drawn spirograph.',
      zh: '滚动圆项会叠出一层层回环与偏移，所以整条轨迹看起来像机械笔画出来的紧凑内旋轮线。',
    },
    formula: [
      'x(t) = 50 + ((R-r) cos t + d cos((R-r)t/r)) · 3.05',
      'y(t) = 50 + ((R-r) sin t - d sin((R-r)t/r)) · 3.05',
      'R = 8.2, r = 2.7 + 0.45s, d = 4.8 + 1.2s',
    ],
    rotate: false,
    particleCount: 82,
    trailSpan: 0.46,
    durationMs: 7600,
    rotationDurationMs: 42000,
    pulseDurationMs: 6200,
    strokeWidth: 4.6,
    point(progress, detailScale) {
      const t = progress * Math.PI * 2
      const R = 8.2
      const r = 2.7 + detailScale * 0.45
      const d = 4.8 + detailScale * 1.2
      const x = (R - r) * Math.cos(t) + d * Math.cos(((R - r) / r) * t)
      const y = (R - r) * Math.sin(t) - d * Math.sin(((R - r) / r) * t)
      return {
        x: 50 + x * 3.05,
        y: 50 + y * 3.05,
      }
    },
  },
  {
    id: 'cardioid-heart',
    name: {
      en: 'Cardioid Heart',
      zh: '心形心脏线',
    },
    tag: {
      en: 'r = a(1 + cosθ)',
      zh: 'r = a(1 + cosθ)',
    },
    description: {
      en: 'Rotating the classic cardioid turns the textbook curve into a more legible upright heart for loading states.',
      zh: '把标准心脏线整体旋转后，数学教材里的曲线就会变成更适合界面加载态的竖向爱心。',
    },
    formula: [
      'r(t) = a(1 + cos t)',
      'a = 8.8 + 0.8s',
      "x'(t) = -sin t · r(t)",
      "y'(t) = -cos t · r(t)",
    ],
    rotate: false,
    particleCount: 74,
    trailSpan: 0.36,
    durationMs: 6200,
    rotationDurationMs: 36000,
    pulseDurationMs: 5200,
    strokeWidth: 4.9,
    point(progress, detailScale) {
      const t = progress * Math.PI * 2
      const a = 8.8 + detailScale * 0.8
      const r = a * (1 + Math.cos(t))
      const baseX = Math.cos(t) * r
      const baseY = Math.sin(t) * r
      return {
        x: 50 - baseY * 2.15,
        y: 50 - baseX * 2.15,
      }
    },
  },
  {
    id: 'fourier-flow',
    name: {
      en: 'Fourier Flow',
      zh: '傅里叶流形',
    },
    tag: {
      en: 'Fourier Curve',
      zh: '傅里叶曲线',
    },
    description: {
      en: 'Several sine and cosine components interfere with one another, so the outline keeps mutating like a living waveform.',
      zh: '多组正弦与余弦彼此干涉后，轮廓会不断变形，看起来像一条有生命的信号波。',
    },
    formula: [
      'x(t) = 50 + 17 cos t + 7.5 cos(3t + 0.6m) + 3.2 sin(5t - 0.4)',
      'y(t) = 50 + 15 sin t + 8.2 sin(2t + 0.25) - 4.2 cos(4t - 0.5m)',
      'm = 1 + 0.16s',
    ],
    rotate: false,
    particleCount: 92,
    trailSpan: 0.31,
    durationMs: 8400,
    rotationDurationMs: 44000,
    pulseDurationMs: 6800,
    strokeWidth: 4.2,
    point(progress, detailScale) {
      const t = progress * Math.PI * 2
      const mix = 1 + detailScale * 0.16
      const x =
        17 * Math.cos(t) +
        7.5 * Math.cos(3 * t + 0.6 * mix) +
        3.2 * Math.sin(5 * t - 0.4)
      const y =
        15 * Math.sin(t) +
        8.2 * Math.sin(2 * t + 0.25) -
        4.2 * Math.cos(4 * t - 0.5 * mix)
      return {
        x: 50 + x,
        y: 50 + y,
      }
    },
  },
]

export const FEATURED_CURVE_IDS = MATH_CURVE_LOADERS.map((curve) => curve.id)

export const TRANSITION_CURVE_IDS = [
  'original-thinking',
  'rose-orbit',
  'lissajous-drift',
  'lemniscate-bloom',
  'cardioid-heart',
  'fourier-flow',
]

export function getCurveConfigById(id: string) {
  return MATH_CURVE_LOADERS.find((curve) => curve.id === id)
}

export function normalizeCurveProgress(progress: number) {
  return ((progress % 1) + 1) % 1
}

export function getCurveDetailScale(time: number, config: MathCurveConfig, phaseOffset: number) {
  const pulseProgress =
    ((time + phaseOffset * config.pulseDurationMs) % config.pulseDurationMs) /
    config.pulseDurationMs
  const pulseAngle = pulseProgress * Math.PI * 2
  return 0.52 + ((Math.sin(pulseAngle + 0.55) + 1) / 2) * 0.48
}

export function getCurveRotation(time: number, config: MathCurveConfig, phaseOffset: number) {
  if (!config.rotate) {
    return 0
  }

  return -(
    ((time + phaseOffset * config.rotationDurationMs) % config.rotationDurationMs) /
    config.rotationDurationMs
  ) * 360
}

export function buildCurvePath(
  config: MathCurveConfig,
  detailScale: number,
  steps = 360,
) {
  return Array.from({ length: steps + 1 }, (_, index) => {
    const point = config.point(index / steps, detailScale, config)
    return `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`
  }).join(' ')
}

export function getCurveParticle(
  config: MathCurveConfig,
  index: number,
  particleCount: number,
  progress: number,
  detailScale: number,
) {
  const tailOffset = index / Math.max(1, particleCount - 1)
  const point = config.point(
    normalizeCurveProgress(progress - tailOffset * config.trailSpan),
    detailScale,
    config,
  )
  const fade = Math.pow(1 - tailOffset, 0.56)

  return {
    x: point.x,
    y: point.y,
    radius: 0.9 + fade * 2.7,
    opacity: 0.04 + fade * 0.96,
  }
}
