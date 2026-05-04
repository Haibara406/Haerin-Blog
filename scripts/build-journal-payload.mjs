import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeSlug from 'rehype-slug'
import rehypeStringify from 'rehype-stringify'
import { unified } from 'unified'

const projectRoot = process.cwd()
const sourceRoot = path.join(projectRoot, 'content/journals-private')
const outputPath = path.join(projectRoot, 'public/journal-data/payload.json')
const passwordPath = path.join(projectRoot, '.journal-password')
const attachmentsRoot =
  process.env.JOURNAL_ATTACHMENTS_DIR ||
  '/Users/haibara/Library/Mobile Documents/iCloud~md~obsidian/Documents/Haibara/attachments'
const journalTypes = ['daily', 'weekly', 'monthly', 'yearly']
const iterations = 310000
const imageExtensions = new Set(['.avif', '.gif', '.jpeg', '.jpg', '.png', '.webp'])

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function toBase64(bytes) {
  return Buffer.from(bytes).toString('base64')
}

function fromString(value) {
  return new TextEncoder().encode(value)
}

function normalizeDate(value) {
  if (!value) {
    return ''
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10)
  }

  return String(value).replace(/^"|"$/g, '').slice(0, 10)
}

function normalizeNumber(value) {
  if (value === undefined || value === null || value === '') {
    return null
  }

  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function isPublishable(data) {
  return data.publish !== false
}

function getPassword() {
  if (process.env.JOURNAL_PASSWORD) {
    return process.env.JOURNAL_PASSWORD
  }

  if (fs.existsSync(passwordPath)) {
    return fs.readFileSync(passwordPath, 'utf8').trim()
  }

  const generatedPassword = crypto.randomBytes(24).toString('base64url')
  fs.writeFileSync(passwordPath, `${generatedPassword}\n`, { encoding: 'utf8', mode: 0o600 })
  console.log(`[journal:encrypt] Generated local password file: ${passwordPath}`)
  console.log('[journal:encrypt] Keep this file private. It is ignored by Git.')
  return generatedPassword
}

function getMimeType(fileName) {
  const extension = path.extname(fileName).toLowerCase()

  switch (extension) {
    case '.avif':
      return 'image/avif'
    case '.gif':
      return 'image/gif'
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.png':
      return 'image/png'
    case '.webp':
      return 'image/webp'
    default:
      return 'application/octet-stream'
  }
}

function getAttachmentDataUrl(target) {
  const cleanTarget = target.split('|')[0]?.split('#')[0]?.trim()
  const fileName = cleanTarget ? path.basename(cleanTarget) : ''
  const extension = path.extname(fileName).toLowerCase()

  if (!fileName || !imageExtensions.has(extension)) {
    return null
  }

  const attachmentPath = path.join(attachmentsRoot, fileName)

  if (!fs.existsSync(attachmentPath)) {
    return {
      missing: true,
      fileName,
    }
  }

  const encoded = fs.readFileSync(attachmentPath).toString('base64')
  return {
    dataUrl: `data:${getMimeType(fileName)};base64,${encoded}`,
    fileName,
  }
}

function escapeMarkdownAlt(value) {
  return value.replace(/[[\]]/g, '')
}

function preprocessObsidianMarkdown(markdown) {
  return markdown
    .replace(/%%[\s\S]*?%%/g, '')
    .replace(/!\[\[([^\]]+)\]\]/g, (_, target) => {
      const attachment = getAttachmentDataUrl(target)

      if (attachment?.dataUrl) {
        return `![${escapeMarkdownAlt(attachment.fileName)}](${attachment.dataUrl})`
      }

      if (attachment?.missing) {
        return `> [!warning] 图片未找到\n> ${attachment.fileName} 没有在 attachments 目录中找到。`
      }

      const label = target.split('|')[0]?.split('/').pop()?.replace(/\.base$/i, '') || '关联内容'
      return `> [!info] 关联内容\n> ${label} 已在页面下方整理为站内关联列表。`
    })
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]]+)\]\]/g, (_, target) => target.split('#')[0])
}

function walk(node, visitor) {
  if (!node || typeof node !== 'object') {
    return
  }

  visitor(node)

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      walk(child, visitor)
    }
  }
}

function nodeText(node) {
  if (!node) {
    return ''
  }

  if (node.type === 'text') {
    return node.value || ''
  }

  if (!Array.isArray(node.children)) {
    return ''
  }

  return node.children.map(nodeText).join('')
}

function rehypeJournalCallouts() {
  return (tree) => {
    walk(tree, (node) => {
      if (node.type !== 'element' || node.tagName !== 'blockquote' || !Array.isArray(node.children)) {
        return
      }

      const firstParagraphIndex = node.children.findIndex(
        (child) => child.type === 'element' && child.tagName === 'p',
      )
      const firstParagraph = node.children[firstParagraphIndex]
      const text = nodeText(firstParagraph).trim()
      const [markerLine, ...bodyLines] = text.split(/\n+/)
      const match = markerLine.match(/^\[!(\w+)\][+-]?\s*(.*)$/)

      if (!match) {
        return
      }

      const [, calloutType, title] = match
      const bodyText = bodyLines.join('\n').trim()

      if (firstParagraphIndex >= 0) {
        if (bodyText && firstParagraph) {
          firstParagraph.children = [{ type: 'text', value: bodyText }]
        } else {
          node.children.splice(firstParagraphIndex, 1)
        }
      }

      node.properties = {
        ...(node.properties || {}),
        className: ['journal-callout', `journal-callout-${calloutType.toLowerCase()}`],
        dataCallout: calloutType.toLowerCase(),
      }

      node.children.unshift({
        type: 'element',
        tagName: 'p',
        properties: { className: ['journal-callout-title'] },
        children: [{ type: 'text', value: title || calloutType }],
      })
    })
  }
}

function splitHighlightedText(value) {
  const parts = []
  const highlightPattern = /==([^=]+)==/g
  let lastIndex = 0
  let match

  while ((match = highlightPattern.exec(value))) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: value.slice(lastIndex, match.index) })
    }

    parts.push({
      type: 'element',
      tagName: 'mark',
      properties: {},
      children: [{ type: 'text', value: match[1] }],
    })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < value.length) {
    parts.push({ type: 'text', value: value.slice(lastIndex) })
  }

  return parts
}

function transformObsidianHighlights(node, insideCode = false) {
  if (!node || typeof node !== 'object') {
    return
  }

  const isCodeElement =
    node.type === 'element' && (node.tagName === 'code' || node.tagName === 'pre')
  const skip = insideCode || isCodeElement

  if (!Array.isArray(node.children) || skip) {
    return
  }

  node.children = node.children.flatMap((child) => {
    if (child.type === 'text' && child.value?.includes('==')) {
      return splitHighlightedText(child.value)
    }

    transformObsidianHighlights(child, skip)
    return [child]
  })
}

function rehypeObsidianHighlights() {
  return (tree) => {
    transformObsidianHighlights(tree)
  }
}

function renderMarkdown(markdown) {
  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeJournalCallouts)
    .use(rehypeObsidianHighlights)
    .use(rehypeStringify)
    .processSync(preprocessObsidianMarkdown(markdown))
    .toString()
}

function plainTextExcerpt(markdown, fallback) {
  const text = markdown
    .replace(/^---[\s\S]*?---/, '')
    .replace(/!\[\[[^\]]+\]\]/g, '')
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/> \[![^\]]+\].*/g, '')
    .replace(/[#>*_`~\-\[\]()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return (fallback || text).slice(0, 180)
}

function getPeriodLabel(type, data, date) {
  if (type === 'weekly') {
    const start = normalizeDate(data.week_start)
    const end = normalizeDate(data.week_end)
    return start && end ? `${start} - ${end}` : date
  }

  if (type === 'monthly') {
    return data.month_id ? String(data.month_id) : date.slice(0, 7)
  }

  if (type === 'yearly') {
    return data.year_id ? String(data.year_id) : date.slice(0, 4)
  }

  return date
}

function readEntries() {
  if (!fs.existsSync(sourceRoot)) {
    throw new Error(`Private journal directory does not exist: ${sourceRoot}`)
  }

  const entries = []

  for (const type of journalTypes) {
    const dir = path.join(sourceRoot, type)
    if (!fs.existsSync(dir)) {
      continue
    }

    const files = fs
      .readdirSync(dir)
      .filter((fileName) => fileName.endsWith('.md'))
      .sort((a, b) => a.localeCompare(b))

    for (const fileName of files) {
      const fullPath = path.join(dir, fileName)
      const raw = fs.readFileSync(fullPath, 'utf8')
      const { data, content } = matter(raw)

      if (!isPublishable(data)) {
        continue
      }

      const slug = fileName.replace(/\.md$/, '')
      const date = normalizeDate(data.journal_date || data.date || slug)
      const title = data.title ? String(data.title) : slug

      entries.push({
        slug,
        type,
        title,
        date,
        periodLabel: getPeriodLabel(type, data, date),
        yearId: data.year_id ? String(data.year_id) : date.slice(0, 4),
        monthId: data.month_id ? String(data.month_id) : date.slice(0, 7),
        weekId: data.week_id ? String(data.week_id) : '',
        sample: data.sample === true,
        weekStart: normalizeDate(data.week_start),
        weekEnd: normalizeDate(data.week_end),
        monthStart: normalizeDate(data.month_start),
        monthEnd: normalizeDate(data.month_end),
        yearStart: normalizeDate(data.year_start),
        yearEnd: normalizeDate(data.year_end),
        status: data.status ? String(data.status) : '',
        highlight: data.highlight ? String(data.highlight) : '',
        nextFocus: data.next_focus ? String(data.next_focus) : '',
        metrics: {
          caloriesBurned: normalizeNumber(data.calories_burned ?? data.avg_calories_burned),
          exerciseMinutes: normalizeNumber(data.exercise_minutes ?? data.avg_exercise_minutes),
          steps: normalizeNumber(data.steps ?? data.avg_steps),
          walkingDistanceKm: normalizeNumber(data.walking_distance_km ?? data.avg_walking_distance_km),
          sleepHours: normalizeNumber(data.sleep_hours ?? data.avg_sleep_hours),
          studyHours: normalizeNumber(data.study_hours ?? data.avg_study_hours),
          totalStudyHours: normalizeNumber(data.total_study_hours),
        },
        excerpt: plainTextExcerpt(content, data.highlight ? String(data.highlight) : ''),
        contentHtml: renderMarkdown(content),
        related: [],
      })
    }
  }

  const byDateDesc = (a, b) => (a.date < b.date ? 1 : -1)
  entries.sort(byDateDesc)

  const daily = entries.filter((entry) => entry.type === 'daily')
  const weekly = entries.filter((entry) => entry.type === 'weekly')
  const monthly = entries.filter((entry) => entry.type === 'monthly')

  for (const entry of entries) {
    if (entry.type === 'weekly') {
      entry.related = daily
        .filter((item) => item.date >= entry.weekStart && item.date <= entry.weekEnd)
        .map(({ type, slug, title, date, highlight }) => ({ type, slug, title, date, highlight }))
    }

    if (entry.type === 'monthly') {
      entry.related = [...daily, ...weekly]
        .filter((item) => item.monthId === entry.monthId)
        .map(({ type, slug, title, date, highlight }) => ({ type, slug, title, date, highlight }))
    }

    if (entry.type === 'yearly') {
      entry.related = [...monthly, ...weekly]
        .filter((item) => item.yearId === entry.yearId)
        .map(({ type, slug, title, date, highlight }) => ({ type, slug, title, date, highlight }))
    }
  }

  return entries
}

async function encryptDataset(dataset, password) {
  const salt = crypto.webcrypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.webcrypto.getRandomValues(new Uint8Array(12))
  const baseKey = await crypto.webcrypto.subtle.importKey(
    'raw',
    fromString(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  const key = await crypto.webcrypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt,
      iterations,
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt'],
  )
  const encoded = fromString(JSON.stringify(dataset))
  const ciphertext = await crypto.webcrypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded)

  return {
    version: 1,
    algorithm: 'AES-GCM',
    kdf: {
      name: 'PBKDF2',
      hash: 'SHA-256',
      iterations,
      salt: toBase64(salt),
    },
    iv: toBase64(iv),
    ciphertext: toBase64(new Uint8Array(ciphertext)),
    createdAt: new Date().toISOString(),
  }
}

const password = getPassword()
const entries = readEntries()
const dataset = {
  version: 1,
  generatedAt: new Date().toISOString(),
  counts: journalTypes.reduce((acc, type) => {
    acc[type] = entries.filter((entry) => entry.type === type).length
    return acc
  }, {}),
  entries,
}

ensureDir(path.dirname(outputPath))
const payload = await encryptDataset(dataset, password)
fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')

console.log('[journal:encrypt] Encrypted journal payload created.')
console.log(`  - entries: ${entries.length}`)
console.log(`  - output: ${outputPath}`)
