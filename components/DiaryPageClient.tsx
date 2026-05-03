'use client'

import { startTransition, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  CalendarRange,
  Clock3,
  Copy,
  Heart,
  MapPin,
  Share2,
  Sparkles,
  SquarePen,
} from 'lucide-react'
import { useLanguage } from './LanguageProvider'
import { useTheme } from './ThemeProvider'

type Language = 'en' | 'zh'
type MoodKey = 'clear' | 'steady' | 'warm' | 'storm'

interface DiaryEntry {
  date: string
  content: string
  location: string
  mood: MoodKey
  favorite: boolean
  updatedAt: string
}

const STORAGE_KEY = 'haerin-blog-diary-v1'

const MOODS: Array<{
  key: MoodKey
  label: Record<Language, string>
  detail: Record<Language, string>
}> = [
  {
    key: 'clear',
    label: { en: 'Clear', zh: '晴朗' },
    detail: { en: 'Focused and light', zh: '专注且轻盈' },
  },
  {
    key: 'steady',
    label: { en: 'Steady', zh: '稳定' },
    detail: { en: 'Grounded and calm', zh: '平稳而安定' },
  },
  {
    key: 'warm',
    label: { en: 'Warm', zh: '温热' },
    detail: { en: 'Soft and open', zh: '柔和且松弛' },
  },
  {
    key: 'storm',
    label: { en: 'Storm', zh: '起伏' },
    detail: { en: 'Tense but honest', zh: '紧绷但真实' },
  },
]

const PROMPTS = [
  {
    title: { en: 'Morning Intention', zh: '清晨意图' },
    body: {
      en: 'What deserves your best attention today, and what can stay quiet in the background?',
      zh: '今天最值得你投入注意力的事情是什么？又有什么可以先安静地放在背景里？',
    },
  },
  {
    title: { en: 'Afternoon Reset', zh: '午后校准' },
    body: {
      en: 'Pause for a minute. Which feeling has been following you all day, and what does it want from you?',
      zh: '暂停一分钟。今天一直跟着你的情绪是什么？它真正想提醒你什么？',
    },
  },
  {
    title: { en: 'Quiet Observation', zh: '安静观察' },
    body: {
      en: 'Write down one detail you almost ignored today. Why did it stay with you after everything else passed?',
      zh: '记下一件今天差点被你忽略的细节。为什么在其他事情都过去后，它还留在你心里？',
    },
  },
  {
    title: { en: 'Evening Review', zh: '夜晚复盘' },
    body: {
      en: 'What felt alive today, and what drained you more than it should have?',
      zh: '今天什么让你感到有生命力？又有什么比预想中更消耗你？',
    },
  },
  {
    title: { en: 'Future Note', zh: '写给未来' },
    body: {
      en: 'If you re-read this page a month later, what would you hope to remember about this version of yourself?',
      zh: '如果一个月后重读这页，你希望未来的自己记住现在的你什么？',
    },
  },
]

const SEEDED_NOTES = [
  {
    offset: 1,
    content: {
      en: 'I want to focus on positive thinking and being productive. Even if the day feels crowded, I can still protect one clear intention and finish it well.',
      zh: '我想把注意力放在积极思考和真正完成事情上。哪怕今天很满，也至少留住一个清晰目标，把它做好。',
    },
    location: { en: 'Window seat', zh: '窗边座位' },
  },
  {
    offset: 2,
    content: {
      en: 'The smallest win today was that I slowed down before replying. That tiny pause saved the tone of the whole conversation.',
      zh: '今天最小却很重要的收获，是我在回复前先慢了一秒。那一秒保住了整段对话的语气。',
    },
    location: { en: 'Campus path', zh: '校园小路' },
  },
  {
    offset: 3,
    content: {
      en: 'I kept chasing neat plans, but the thing that really mattered was showing up even when the plan was imperfect.',
      zh: '我一直想把计划做得很漂亮，但今天真正重要的，其实是计划不完美时我也还是出现了。',
    },
    location: { en: 'Studio desk', zh: '书桌前' },
  },
  {
    offset: 7,
    content: {
      en: 'A week later, the loud problems are gone and the quiet routines are what remain. That probably tells me what is actually shaping my days.',
      zh: '隔了一周再看，喧闹的问题已经退下去了，留下来的反而是那些安静的日常。它们大概才是真正在塑造我生活的东西。',
    },
    location: { en: 'Cafe corner', zh: '咖啡馆角落' },
  },
  {
    offset: 31,
    content: {
      en: 'I do not need a dramatic turning point every month. A cleaner rhythm, a few better choices, and a softer mind are enough progress.',
      zh: '我不需要每个月都拥有戏剧性的转折。更干净的节奏、更好的几个选择，以及更柔软的心态，本身就是进步。',
    },
    location: { en: 'Late train ride', zh: '夜间列车上' },
  },
]

const PAGE_COPY: Record<
  Language,
  {
    kicker: string
    title: string
    subtitle: string
    panelLabel: string
    panelBody: string
    panelNote: string
    statStreak: string
    statWritten: string
    statFavorites: string
    timelineTitle: string
    timelineHint: string
    openToday: string
    timelineEmpty: string
    timelineDraft: string
    groupUpcoming: string
    groupToday: string
    groupYesterday: string
    groupLastWeek: string
    groupLastMonth: string
    groupArchive: string
    selectedLabel: string
    saving: string
    saved: string
    localOnly: string
    weekLabel: string
    moodLabel: string
    promptLabel: string
    entryLabel: string
    placeholder: string
    locationPlaceholder: string
    words: string
    emptyWordState: string
    favoriteOn: string
    favoriteOff: string
    copyAction: string
    shareAction: string
    favoriteAction: string
    copiedNotice: string
    sharedNotice: string
    shareFallbackNotice: string
    emptyEntryNotice: string
    actionFailedNotice: string
    statsSummary: string
  }
> = {
  en: {
    kicker: 'Notebook Diary',
    title: 'A diary page rebuilt for the blog, not pasted on top of it',
    subtitle:
      'The original notebook visual stays recognizable, but the page now belongs to the Haerin Blog system: it reuses the site header, theme, and language state, while turning the fake date rail, buttons, and writing area into a real daily workflow.',
    panelLabel: 'How It Works',
    panelBody:
      'Entries are stored locally in your browser, each day can be opened directly from the left timeline or the weekly strip, and changes autosave as you write.',
    panelNote:
      'The old source header is removed completely. The diary now behaves like a first-class page inside the blog instead of an isolated demo.',
    statStreak: 'Writing streak',
    statWritten: 'Written pages',
    statFavorites: 'Favorited',
    timelineTitle: 'Diary Timeline',
    timelineHint: 'Pick any date, continue an old page, or open today and start fresh.',
    openToday: 'Open today',
    timelineEmpty: 'No text yet. This page is ready for a first note.',
    timelineDraft: 'Draft ready',
    groupUpcoming: 'Upcoming',
    groupToday: 'Today',
    groupYesterday: 'Yesterday',
    groupLastWeek: 'Last Week',
    groupLastMonth: 'Last Month',
    groupArchive: 'Archive',
    selectedLabel: 'Selected page',
    saving: 'Autosaving',
    saved: 'Autosaved',
    localOnly: 'Stored locally',
    weekLabel: 'Week strip',
    moodLabel: 'How does today feel?',
    promptLabel: 'Prompt of the day',
    entryLabel: 'Write on the page',
    placeholder:
      'Start with a detail, a feeling, or a sentence you do not want to lose. The page saves automatically.',
    locationPlaceholder: 'Where are you right now?',
    words: 'words',
    emptyWordState: 'Blank page',
    favoriteOn: 'Favorite page',
    favoriteOff: 'Not starred',
    copyAction: 'Copy',
    shareAction: 'Share',
    favoriteAction: 'Star',
    copiedNotice: 'Current entry copied.',
    sharedNotice: 'Share sheet opened.',
    shareFallbackNotice: 'Date link copied to clipboard.',
    emptyEntryNotice: 'Write something first, then use the page actions.',
    actionFailedNotice: 'This action is unavailable in the current browser.',
    statsSummary: 'Adapted notebook layout with real persistence',
  },
  zh: {
    kicker: 'Diary 随记',
    title: '不是把原页面贴进博客，而是把它真正改造成博客的一部分',
    subtitle:
      '原来的 notebook 识别度被保留下来，但页面已经接入 Haerin Blog 的导航、主题与语言体系，同时把假时间轴、假按钮和假输入区域全部做成了真实可用的日记流程。',
    panelLabel: '页面说明',
    panelBody:
      '内容会保存在浏览器本地；左侧时间轴和下方周视图都能真实切换日期；输入时自动保存，不再只是展示效果。',
    panelNote:
      '原项目顶部 header 已完全移除。现在这页是博客里的正式页面，而不是孤立的 demo。',
    statStreak: '连续记录',
    statWritten: '已写页面',
    statFavorites: '已收藏',
    timelineTitle: '日记时间轴',
    timelineHint: '可以继续旧页面，也可以直接打开今天这一页开始写。',
    openToday: '打开今天',
    timelineEmpty: '还没有写内容，这一页已经准备好给你开始记录。',
    timelineDraft: '草稿已创建',
    groupUpcoming: '未来页面',
    groupToday: '今天',
    groupYesterday: '昨天',
    groupLastWeek: '上周',
    groupLastMonth: '上月',
    groupArchive: '更早',
    selectedLabel: '当前页面',
    saving: '正在自动保存',
    saved: '已自动保存',
    localOnly: '仅保存在本地',
    weekLabel: '周视图',
    moodLabel: '今天的状态',
    promptLabel: '今日提问',
    entryLabel: '写在这一页',
    placeholder: '从一个细节、一种情绪，或者一句你不想丢掉的话开始。输入会自动保存。',
    locationPlaceholder: '你现在在哪里？',
    words: '字',
    emptyWordState: '空白页',
    favoriteOn: '已收藏页面',
    favoriteOff: '未收藏',
    copyAction: '复制',
    shareAction: '分享',
    favoriteAction: '收藏',
    copiedNotice: '当前页面已复制。',
    sharedNotice: '已打开分享面板。',
    shareFallbackNotice: '日期链接已复制到剪贴板。',
    emptyEntryNotice: '先写点内容，再使用这些页面操作。',
    actionFailedNotice: '当前浏览器暂时不支持这个操作。',
    statsSummary: '保留 notebook 质感，但交互已全部落地',
  },
}

function formatDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseDateKey(dateKey: string) {
  return new Date(`${dateKey}T12:00:00`)
}

function shiftDateKey(dateKey: string, days: number) {
  const date = parseDateKey(dateKey)
  date.setDate(date.getDate() + days)
  return formatDateKey(date)
}

function isValidDateKey(value: string | null) {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value))
}

function differenceInDays(from: string, to: string) {
  const fromTime = parseDateKey(from).getTime()
  const toTime = parseDateKey(to).getTime()
  return Math.round((toTime - fromTime) / 86400000)
}

function hashValue(value: string) {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }
  return hash
}

function countWords(content: string) {
  const trimmed = content.trim()
  if (!trimmed) {
    return 0
  }

  const latinWords = trimmed.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g)?.length ?? 0
  const cjkChars = (trimmed.match(/[\u4e00-\u9fff]/g) ?? []).length
  return latinWords + cjkChars
}

function getPromptForDate(dateKey: string, language: Language) {
  const prompt = PROMPTS[hashValue(dateKey) % PROMPTS.length]
  return {
    title: prompt.title[language],
    body: prompt.body[language],
  }
}

function createBlankEntry(dateKey: string): DiaryEntry {
  const mood = MOODS[hashValue(dateKey) % MOODS.length]?.key ?? 'steady'
  return {
    date: dateKey,
    content: '',
    location: '',
    mood,
    favorite: false,
    updatedAt: new Date().toISOString(),
  }
}

function buildSeedEntries(todayKey: string, language: Language): Record<string, DiaryEntry> {
  const seeded: Record<string, DiaryEntry> = {
    [todayKey]: createBlankEntry(todayKey),
  }

  SEEDED_NOTES.forEach((note, index) => {
    const dateKey = shiftDateKey(todayKey, -note.offset)
    seeded[dateKey] = {
      date: dateKey,
      content: note.content[language],
      location: note.location[language],
      mood: MOODS[index % MOODS.length]?.key ?? 'steady',
      favorite: note.offset === 7,
      updatedAt: new Date().toISOString(),
    }
  })

  return seeded
}

function loadStoredEntries(todayKey: string, language: Language) {
  if (typeof window === 'undefined') {
    return buildSeedEntries(todayKey, language)
  }

  try {
    const preferredLanguage =
      window.localStorage.getItem('language') === 'zh' ? 'zh' : language
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return buildSeedEntries(todayKey, preferredLanguage)
    }

    const parsed = JSON.parse(raw) as Record<string, Partial<DiaryEntry>>
    const sanitized: Record<string, DiaryEntry> = {}

    Object.entries(parsed).forEach(([dateKey, entry]) => {
      if (!isValidDateKey(dateKey)) {
        return
      }

      sanitized[dateKey] = {
        date: dateKey,
        content: typeof entry.content === 'string' ? entry.content : '',
        location: typeof entry.location === 'string' ? entry.location : '',
        mood: MOODS.some((item) => item.key === entry.mood) ? (entry.mood as MoodKey) : createBlankEntry(dateKey).mood,
        favorite: Boolean(entry.favorite),
        updatedAt: typeof entry.updatedAt === 'string' ? entry.updatedAt : new Date().toISOString(),
      }
    })

    return Object.keys(sanitized).length > 0
      ? sanitized
      : buildSeedEntries(todayKey, preferredLanguage)
  } catch {
    return buildSeedEntries(todayKey, language)
  }
}

function formatTimelinePrimary(dateKey: string, todayKey: string, language: Language) {
  const diff = differenceInDays(dateKey, todayKey)
  if (diff === 0) {
    return language === 'zh' ? '今天' : 'Today'
  }
  if (diff === 1) {
    return language === 'zh' ? '昨天' : 'Yesterday'
  }
  return new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : 'en-US', {
    weekday: 'short',
  }).format(parseDateKey(dateKey))
}

function formatTimelineSecondary(dateKey: string, language: Language) {
  return new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : 'en-US', {
    month: 'short',
    day: 'numeric',
  }).format(parseDateKey(dateKey))
}

function getGroupLabel(dateKey: string, todayKey: string, copy: (typeof PAGE_COPY)['en']) {
  const diff = differenceInDays(dateKey, todayKey)
  if (diff < 0) {
    return copy.groupUpcoming
  }
  if (diff === 0) {
    return copy.groupToday
  }
  if (diff === 1) {
    return copy.groupYesterday
  }
  if (diff < 7) {
    return copy.groupLastWeek
  }
  if (diff < 31) {
    return copy.groupLastMonth
  }
  return copy.groupArchive
}

function formatFullDate(dateKey: string, language: Language) {
  return new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : 'en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(parseDateKey(dateKey))
}

function formatMonthLabel(dateKey: string, language: Language) {
  return new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : 'en-US', {
    month: 'long',
    year: 'numeric',
  }).format(parseDateKey(dateKey))
}

function formatSavedTime(date: string, language: Language) {
  return new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

function excerptText(content: string, emptyLabel: string) {
  const trimmed = content.trim()
  if (!trimmed) {
    return emptyLabel
  }
  return trimmed.length > 90 ? `${trimmed.slice(0, 90)}...` : trimmed
}

function computeStreak(entries: Record<string, DiaryEntry>, todayKey: string) {
  let streak = 0
  let cursor = todayKey

  while (entries[cursor]?.content.trim()) {
    streak += 1
    cursor = shiftDateKey(cursor, -1)
  }

  return streak
}

function NotebookScene({ actualTheme }: { actualTheme: 'light' | 'dark' }) {
  return (
    <div className="rounded-[1.8rem] border border-stone-200/80 bg-gradient-to-br from-stone-50 via-white to-amber-50/90 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-gray-800 dark:from-gray-900 dark:via-gray-950 dark:to-stone-950 dark:shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.4rem] border border-black/5 bg-[#f5f1e8] dark:border-white/5 dark:bg-[#111315]">
        <div className="absolute inset-x-0 top-0 h-[62%] bg-gradient-to-b from-white via-stone-100 to-transparent dark:from-slate-800 dark:via-slate-900" />
        <div className="absolute right-10 top-10 h-14 w-14 rounded-full bg-amber-300/80 blur-sm dark:bg-amber-500/35" />
        <div className="absolute left-6 top-20 h-5 w-20 rounded-full bg-white/80 blur-md dark:bg-white/10" />
        <div className="absolute right-16 top-28 h-4 w-16 rounded-full bg-white/70 blur-md dark:bg-white/10" />
        <div className="absolute inset-x-0 bottom-[18%] h-[18%] bg-gradient-to-r from-stone-300 via-stone-400 to-stone-300 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700" />
        <div className="absolute inset-x-0 bottom-0 h-[22%] bg-gradient-to-t from-stone-700 to-stone-600 dark:from-stone-900 dark:to-stone-800" />
        <div className="absolute bottom-[18%] left-[18%] h-20 w-24 rounded-t-full bg-stone-500/90 dark:bg-stone-700/80" />
        <div className="absolute bottom-[16%] right-[18%] h-24 w-32 rounded-t-full bg-stone-800/95 dark:bg-black/80" />
        <div className="absolute bottom-[20%] left-1/2 h-10 w-10 -translate-x-1/2 rounded-full bg-amber-900/80 dark:bg-amber-300/60" />
        <div className="absolute bottom-[17%] left-1/2 h-16 w-3 -translate-x-1/2 rounded-full bg-amber-950/90 dark:bg-amber-200/70" />
        <div className="absolute bottom-[15%] left-1/2 h-2 w-12 -translate-x-1/2 rounded-full bg-stone-900/80 dark:bg-black/80" />
        <div className="absolute inset-0 opacity-[0.18]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '18px 18px', color: actualTheme === 'dark' ? '#0f172a' : '#e7decf' }} />
      </div>
    </div>
  )
}

function ActionButton({
  active,
  children,
  onClick,
}: {
  active?: boolean
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all duration-200 ${
        active
          ? 'border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-950'
          : 'border-gray-200 bg-white/80 text-gray-600 hover:border-gray-400 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-950/60 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}

export default function DiaryPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialDateRef = useRef(searchParams.get('date'))
  const saveTimerRef = useRef<number | null>(null)
  const noticeTimerRef = useRef<number | null>(null)
  const { language } = useLanguage()
  const { actualTheme } = useTheme()
  const copy = PAGE_COPY[language]

  const [mounted, setMounted] = useState(false)
  const [todayKey, setTodayKey] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [entries, setEntries] = useState<Record<string, DiaryEntry>>({})
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    const today = formatDateKey(new Date())
    const storedEntries = loadStoredEntries(today, language)
    const requestedDate = isValidDateKey(initialDateRef.current) ? (initialDateRef.current as string) : today
    const initialEntries = storedEntries[requestedDate]
      ? storedEntries
      : { ...storedEntries, [requestedDate]: createBlankEntry(requestedDate) }

    if (!initialEntries[today]) {
      initialEntries[today] = createBlankEntry(today)
    }

    setMounted(true)
    setTodayKey(today)
    setEntries(initialEntries)
    setSelectedDate(requestedDate)
  }, [])

  useEffect(() => {
    if (!mounted || !selectedDate) {
      return
    }

    startTransition(() => {
      router.replace(`/diary?date=${encodeURIComponent(selectedDate)}`, { scroll: false })
    })
  }, [mounted, router, selectedDate])

  useEffect(() => {
    if (!mounted || !Object.keys(entries).length) {
      return
    }

    setSaveState('saving')
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current)
    }

    saveTimerRef.current = window.setTimeout(() => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
      setSaveState('saved')
    }, 220)

    return () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current)
      }
    }
  }, [entries, mounted])

  useEffect(() => {
    if (saveState !== 'saved') {
      return
    }

    const timer = window.setTimeout(() => {
      setSaveState('idle')
    }, 1400)

    return () => window.clearTimeout(timer)
  }, [saveState])

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) {
        window.clearTimeout(noticeTimerRef.current)
      }
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current)
      }
    }
  }, [])

  const pushNotice = (message: string) => {
    setNotice(message)
    if (noticeTimerRef.current) {
      window.clearTimeout(noticeTimerRef.current)
    }
    noticeTimerRef.current = window.setTimeout(() => {
      setNotice(null)
    }, 2200)
  }

  const ensureDate = (dateKey: string) => {
    if (!isValidDateKey(dateKey)) {
      return
    }

    setEntries((current) => {
      if (current[dateKey]) {
        return current
      }
      return {
        ...current,
        [dateKey]: createBlankEntry(dateKey),
      }
    })
    setSelectedDate(dateKey)
  }

  const updateSelectedEntry = (partial: Partial<DiaryEntry>) => {
    if (!selectedDate) {
      return
    }

    setEntries((current) => {
      const existing = current[selectedDate] ?? createBlankEntry(selectedDate)
      return {
        ...current,
        [selectedDate]: {
          ...existing,
          ...partial,
          updatedAt: new Date().toISOString(),
        },
      }
    })
  }

  const selectedEntry = selectedDate ? entries[selectedDate] ?? createBlankEntry(selectedDate) : null
  const orderedEntries = Object.values(entries).sort((left, right) => right.date.localeCompare(left.date))
  const streak = todayKey ? computeStreak(entries, todayKey) : 0
  const writtenCount = orderedEntries.filter((entry) => entry.content.trim()).length
  const favoriteCount = orderedEntries.filter((entry) => entry.favorite).length
  const wordCount = selectedEntry ? countWords(selectedEntry.content) : 0
  const prompt = selectedDate ? getPromptForDate(selectedDate, language) : null

  const groups = orderedEntries.reduce<Record<string, DiaryEntry[]>>((result, entry) => {
    if (!todayKey) {
      return result
    }

    const label = getGroupLabel(entry.date, todayKey, copy)
    if (!result[label]) {
      result[label] = []
    }
    result[label].push(entry)
    return result
  }, {})

  const groupOrder = [
    copy.groupUpcoming,
    copy.groupToday,
    copy.groupYesterday,
    copy.groupLastWeek,
    copy.groupLastMonth,
    copy.groupArchive,
  ]

  const weekStrip = selectedDate
    ? Array.from({ length: 7 }, (_, index) => shiftDateKey(selectedDate, index - 3))
    : []

  const activeMood = MOODS.find((item) => item.key === selectedEntry?.mood)

  const handleCopy = async () => {
    if (!selectedEntry || !selectedEntry.content.trim()) {
      pushNotice(copy.emptyEntryNotice)
      return
    }

    const payload = [
      formatFullDate(selectedEntry.date, language),
      '',
      `${copy.promptLabel}: ${prompt?.title ?? ''}`,
      prompt?.body ?? '',
      '',
      selectedEntry.content.trim(),
      selectedEntry.location ? '' : '',
      selectedEntry.location ? `${language === 'zh' ? '地点' : 'Location'}: ${selectedEntry.location}` : '',
    ]
      .filter(Boolean)
      .join('\n')

    try {
      await navigator.clipboard.writeText(payload)
      pushNotice(copy.copiedNotice)
    } catch {
      pushNotice(copy.actionFailedNotice)
    }
  }

  const handleShare = async () => {
    if (!selectedEntry || !selectedEntry.content.trim()) {
      pushNotice(copy.emptyEntryNotice)
      return
    }

    const shareUrl = `${window.location.origin}/diary?date=${encodeURIComponent(selectedEntry.date)}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${copy.selectedLabel}: ${formatFullDate(selectedEntry.date, language)}`,
          text: selectedEntry.content.trim(),
          url: shareUrl,
        })
        pushNotice(copy.sharedNotice)
        return
      }

      await navigator.clipboard.writeText(shareUrl)
      pushNotice(copy.shareFallbackNotice)
    } catch (error) {
      const typedError = error as { name?: string }
      if (typedError?.name !== 'AbortError') {
        pushNotice(copy.actionFailedNotice)
      }
    }
  }

  if (!mounted || !selectedEntry || !prompt) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-24">
        <div className="animate-pulse rounded-[2rem] border border-gray-200 bg-white/80 p-8 dark:border-gray-800 dark:bg-gray-950/60">
          <div className="h-4 w-32 rounded-full bg-gray-200 dark:bg-gray-800" />
          <div className="mt-6 h-16 w-full max-w-3xl rounded-[1.5rem] bg-gray-200 dark:bg-gray-800" />
          <div className="mt-6 h-24 w-full rounded-[1.5rem] bg-gray-100 dark:bg-gray-900" />
        </div>
      </div>
    )
  }

  const statusText =
    notice ??
    (saveState === 'saving'
      ? copy.saving
      : saveState === 'saved'
        ? copy.saved
        : copy.localOnly)

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-24">
      <section className="mb-12 grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_320px]">
        <div className="rounded-[2rem] border border-gray-200/80 bg-white/85 p-8 shadow-[0_20px_70px_rgba(15,23,42,0.08)] dark:border-gray-800 dark:bg-gray-950/70 dark:shadow-[0_20px_70px_rgba(0,0,0,0.3)]">
          <p className="text-xs uppercase tracking-[0.28em] text-gray-500 dark:text-gray-400">
            {copy.kicker}
          </p>
          <h1 className="mt-4 max-w-4xl font-serif text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            {copy.title}
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-gray-600 dark:text-gray-300 sm:text-lg">
            {copy.subtitle}
          </p>
        </div>

        <aside className="rounded-[2rem] border border-gray-200/80 bg-gradient-to-br from-gray-50 to-white p-8 dark:border-gray-800 dark:from-gray-900 dark:to-gray-950">
          <p className="text-xs uppercase tracking-[0.28em] text-gray-500 dark:text-gray-400">
            {copy.panelLabel}
          </p>
          <p className="mt-4 text-sm leading-7 text-gray-600 dark:text-gray-300">
            {copy.panelBody}
          </p>
          <p className="mt-4 text-sm leading-7 text-gray-500 dark:text-gray-400">
            {copy.panelNote}
          </p>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-[1.25rem] border border-gray-200/80 bg-white/80 p-4 dark:border-gray-800 dark:bg-black/20">
              <p className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-500">
                {copy.statStreak}
              </p>
              <p className="mt-3 font-serif text-3xl font-semibold tracking-tight">{streak}</p>
            </div>
            <div className="rounded-[1.25rem] border border-gray-200/80 bg-white/80 p-4 dark:border-gray-800 dark:bg-black/20">
              <p className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-500">
                {copy.statWritten}
              </p>
              <p className="mt-3 font-serif text-3xl font-semibold tracking-tight">{writtenCount}</p>
            </div>
            <div className="rounded-[1.25rem] border border-gray-200/80 bg-white/80 p-4 dark:border-gray-800 dark:bg-black/20">
              <p className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-500">
                {copy.statFavorites}
              </p>
              <p className="mt-3 font-serif text-3xl font-semibold tracking-tight">{favoriteCount}</p>
            </div>
          </div>

          <p className="mt-6 text-xs uppercase tracking-[0.22em] text-gray-400 dark:text-gray-500">
            {copy.statsSummary}
          </p>
        </aside>
      </section>

      <section className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="h-fit rounded-[2rem] border border-gray-200/80 bg-white/80 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] xl:sticky xl:top-28 dark:border-gray-800 dark:bg-gray-950/70 dark:shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">
                {copy.timelineTitle}
              </p>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                {copy.timelineHint}
              </p>
            </div>
            <button
              type="button"
              onClick={() => ensureDate(todayKey)}
              className="shrink-0 rounded-full border border-gray-200 px-3 py-2 text-sm text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-900 dark:border-gray-800 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:text-white"
            >
              {copy.openToday}
            </button>
          </div>

          <div className="mt-5 max-h-[70vh] space-y-5 overflow-y-auto pr-1">
            {groupOrder
              .filter((label) => groups[label]?.length)
              .map((label) => (
                <div key={label}>
                  <p className="mb-3 text-xs uppercase tracking-[0.22em] text-gray-400 dark:text-gray-500">
                    {label}
                  </p>
                  <div className="space-y-2">
                    {groups[label].map((entry) => (
                      <button
                        key={entry.date}
                        type="button"
                        onClick={() => ensureDate(entry.date)}
                        className={`w-full rounded-[1.4rem] border px-4 py-4 text-left transition-all duration-200 ${
                          selectedDate === entry.date
                            ? 'border-gray-900 bg-gray-900 text-white shadow-[0_16px_40px_rgba(15,23,42,0.18)] dark:border-gray-100 dark:bg-gray-100 dark:text-gray-950'
                            : 'border-gray-200 bg-white/90 hover:-translate-y-0.5 hover:border-gray-400 dark:border-gray-800 dark:bg-gray-950/70 dark:text-gray-100 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold tracking-tight">
                              {formatTimelinePrimary(entry.date, todayKey, language)}
                            </p>
                            <p
                              className={`mt-1 text-xs uppercase tracking-[0.18em] ${
                                selectedDate === entry.date
                                  ? 'text-white/65 dark:text-gray-600'
                                  : 'text-gray-400 dark:text-gray-500'
                              }`}
                            >
                              {formatTimelineSecondary(entry.date, language)}
                            </p>
                          </div>
                          {entry.favorite ? (
                            <Heart className="h-4 w-4 fill-current" />
                          ) : (
                            <span
                              className={`text-[11px] uppercase tracking-[0.18em] ${
                                selectedDate === entry.date
                                  ? 'text-white/65 dark:text-gray-600'
                                  : 'text-gray-400 dark:text-gray-500'
                              }`}
                            >
                              {countWords(entry.content) ? `${countWords(entry.content)} ${copy.words}` : copy.timelineDraft}
                            </span>
                          )}
                        </div>
                        <p
                          className={`mt-3 line-clamp-3 text-sm leading-6 ${
                            selectedDate === entry.date
                              ? 'text-white/82 dark:text-gray-700'
                              : 'text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          {excerptText(entry.content, copy.timelineEmpty)}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </aside>

        <div className="relative overflow-hidden rounded-[2.6rem] border border-gray-200/80 bg-gradient-to-br from-stone-100 via-white to-stone-200/80 p-2 shadow-[0_30px_90px_rgba(15,23,42,0.1)] dark:border-gray-800 dark:from-stone-950 dark:via-gray-950 dark:to-black dark:shadow-[0_30px_90px_rgba(0,0,0,0.34)] sm:p-3">
          <div className="pointer-events-none absolute inset-4 rounded-[2rem] border border-dashed border-stone-300/70 dark:border-stone-800" />

          <div className="relative overflow-hidden rounded-[2rem] border border-stone-200/80 bg-white/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] dark:border-gray-800 dark:bg-gray-950/92 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <div className="grid lg:grid-cols-[minmax(0,0.98fr)_minmax(0,1.02fr)]">
              <div className="relative border-b border-stone-200/70 dark:border-gray-800 lg:border-b-0 lg:border-r">
                <div className="p-6 sm:p-8 xl:p-10">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-[1.2rem] border border-amber-200/80 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                        <CalendarRange className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">
                          {copy.selectedLabel}
                        </p>
                        <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                          {formatFullDate(selectedDate, language)}
                        </h2>
                      </div>
                    </div>

                    <div className="rounded-full border border-gray-200 bg-white/80 px-4 py-2 text-xs uppercase tracking-[0.2em] text-gray-500 dark:border-gray-800 dark:bg-gray-950/70 dark:text-gray-400">
                      {statusText}
                    </div>
                  </div>

                  <div className="mt-8">
                    <NotebookScene actualTheme={actualTheme} />
                  </div>

                  <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[1.35rem] border border-gray-200/80 bg-white/80 p-4 dark:border-gray-800 dark:bg-black/10">
                      <p className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-500">
                        {copy.statStreak}
                      </p>
                      <p className="mt-3 font-serif text-3xl font-semibold tracking-tight">{streak}</p>
                    </div>
                    <div className="rounded-[1.35rem] border border-gray-200/80 bg-white/80 p-4 dark:border-gray-800 dark:bg-black/10">
                      <p className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-500">
                        {copy.statWritten}
                      </p>
                      <p className="mt-3 font-serif text-3xl font-semibold tracking-tight">{writtenCount}</p>
                    </div>
                    <div className="rounded-[1.35rem] border border-gray-200/80 bg-white/80 p-4 dark:border-gray-800 dark:bg-black/10">
                      <p className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-500">
                        {copy.moodLabel}
                      </p>
                      <p className="mt-3 font-serif text-2xl font-semibold tracking-tight">
                        {activeMood?.label[language]}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8">
                    <div className="mb-3 flex items-center justify-between gap-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">
                        {copy.weekLabel}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatMonthLabel(selectedDate, language)}
                      </p>
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                      {weekStrip.map((dateKey) => {
                        const diff = differenceInDays(dateKey, todayKey)
                        const entry = entries[dateKey]
                        const isActive = selectedDate === dateKey
                        return (
                          <button
                            key={dateKey}
                            type="button"
                            onClick={() => ensureDate(dateKey)}
                            className={`rounded-[1rem] border px-2 py-3 text-center transition-all duration-200 ${
                              isActive
                                ? 'border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-950'
                                : 'border-gray-200 bg-white/80 hover:border-gray-400 dark:border-gray-800 dark:bg-gray-950/50 dark:hover:border-gray-600'
                            }`}
                          >
                            <p
                              className={`text-[11px] uppercase tracking-[0.16em] ${
                                isActive
                                  ? 'text-white/70 dark:text-gray-600'
                                  : 'text-gray-400 dark:text-gray-500'
                              }`}
                            >
                              {diff === 0
                                ? language === 'zh'
                                  ? '今'
                                  : 'Now'
                                : new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : 'en-US', {
                                    weekday: 'narrow',
                                  }).format(parseDateKey(dateKey))}
                            </p>
                            <p className="mt-2 font-serif text-2xl font-semibold tracking-tight">
                              {parseDateKey(dateKey).getDate()}
                            </p>
                            <div className="mt-2 flex justify-center">
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  entry?.content.trim()
                                    ? 'bg-amber-500'
                                    : 'bg-gray-300 dark:bg-gray-700'
                                }`}
                              />
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="mt-8">
                    <p className="text-xs uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">
                      {copy.moodLabel}
                    </p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {MOODS.map((mood) => {
                        const active = selectedEntry.mood === mood.key
                        return (
                          <button
                            key={mood.key}
                            type="button"
                            onClick={() => updateSelectedEntry({ mood: mood.key })}
                            className={`rounded-[1.15rem] border px-4 py-4 text-left transition-all duration-200 ${
                              active
                                ? 'border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-950'
                                : 'border-gray-200 bg-white/80 hover:border-gray-400 dark:border-gray-800 dark:bg-gray-950/60 dark:hover:border-gray-600'
                            }`}
                          >
                            <p className="font-medium tracking-tight">{mood.label[language]}</p>
                            <p
                              className={`mt-1 text-sm ${
                                active
                                  ? 'text-white/75 dark:text-gray-600'
                                  : 'text-gray-500 dark:text-gray-400'
                              }`}
                            >
                              {mood.detail[language]}
                            </p>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="hidden lg:flex pointer-events-none absolute inset-y-12 left-0 -translate-x-1/2 flex-col justify-between">
                  {Array.from({ length: 6 }, (_, index) => (
                    <div key={index} className="relative h-4 w-11">
                      <div className="absolute inset-x-2 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-stone-300 dark:bg-gray-700" />
                      <div className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-[3px] border-stone-300 bg-white dark:border-gray-600 dark:bg-gray-950" />
                      <div className="absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-[3px] border-stone-300 bg-white dark:border-gray-600 dark:bg-gray-950" />
                    </div>
                  ))}
                </div>

                <div className="p-6 sm:p-8 xl:p-10">
                  <div className="rounded-[1.8rem] border border-gray-200/80 bg-gradient-to-br from-stone-50 via-white to-amber-50/60 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)] dark:border-gray-800 dark:from-gray-900 dark:via-gray-950 dark:to-stone-950 dark:shadow-[0_20px_40px_rgba(0,0,0,0.18)]">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">
                          <Sparkles className="h-4 w-4" />
                          {copy.promptLabel}
                        </p>
                        <h3 className="mt-4 font-serif text-3xl font-semibold tracking-tight">
                          {prompt.title}
                        </h3>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/80 px-4 py-2 text-sm text-gray-500 dark:border-gray-800 dark:bg-black/20 dark:text-gray-400">
                        <Clock3 className="h-4 w-4" />
                        {formatSavedTime(selectedEntry.updatedAt, language)}
                      </div>
                    </div>

                    <p className="mt-5 whitespace-pre-line text-base leading-8 text-gray-600 dark:text-gray-300">
                      {prompt.body}
                    </p>

                    <div className="mt-6 flex flex-wrap gap-2">
                      <ActionButton onClick={handleCopy}>
                        <Copy className="h-4 w-4" />
                        {copy.copyAction}
                      </ActionButton>
                      <ActionButton
                        active={selectedEntry.favorite}
                        onClick={() => updateSelectedEntry({ favorite: !selectedEntry.favorite })}
                      >
                        <Heart className={`h-4 w-4 ${selectedEntry.favorite ? 'fill-current' : ''}`} />
                        {copy.favoriteAction}
                      </ActionButton>
                      <ActionButton onClick={handleShare}>
                        <Share2 className="h-4 w-4" />
                        {copy.shareAction}
                      </ActionButton>
                    </div>
                  </div>

                  <label className="mt-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">
                    <SquarePen className="h-4 w-4" />
                    {copy.entryLabel}
                  </label>

                  <div className="mt-4 overflow-hidden rounded-[1.9rem] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
                    <div
                      className="relative min-h-[360px] bg-[size:100%_42px] px-5 py-4"
                      style={{
                        backgroundImage: `repeating-linear-gradient(180deg, transparent 0, transparent 40px, ${
                          actualTheme === 'dark' ? '#20242c' : '#ebe6db'
                        } 40px, ${actualTheme === 'dark' ? '#20242c' : '#ebe6db'} 41px)`,
                      }}
                    >
                      <textarea
                        value={selectedEntry.content}
                        onChange={(event) => updateSelectedEntry({ content: event.target.value })}
                        placeholder={copy.placeholder}
                        className="h-[360px] w-full resize-none border-none bg-transparent text-[15px] leading-[41px] text-gray-700 outline-none placeholder:text-gray-400 dark:text-gray-200 dark:placeholder:text-gray-600"
                      />
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto_auto]">
                    <label className="inline-flex items-center gap-3 rounded-full border border-gray-200 bg-white/80 px-4 py-3 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-950/70 dark:text-gray-300">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <input
                        value={selectedEntry.location}
                        onChange={(event) => updateSelectedEntry({ location: event.target.value })}
                        placeholder={copy.locationPlaceholder}
                        className="w-full min-w-0 border-none bg-transparent outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
                      />
                    </label>

                    <div className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white/80 px-4 py-3 text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-950/70 dark:text-gray-400">
                      {wordCount ? `${wordCount} ${copy.words}` : copy.emptyWordState}
                    </div>

                    <div className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white/80 px-4 py-3 text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-950/70 dark:text-gray-400">
                      {selectedEntry.favorite ? copy.favoriteOn : copy.favoriteOff}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
