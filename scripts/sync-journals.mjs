import fs from 'fs'
import path from 'path'

const sourceRoot =
  process.env.JOURNAL_SOURCE_DIR ||
  '/Users/haibara/Library/Mobile Documents/iCloud~md~obsidian/Documents/Haibara/复盘'

const projectRoot = process.cwd()
const targetRoot = path.join(projectRoot, 'content/journals-private')

const groups = [
  { source: '日报', target: 'daily' },
  { source: '周报', target: 'weekly' },
  { source: '月报', target: 'monthly' },
  { source: '年报', target: 'yearly' },
]

const sampleReports = {
  monthly: {
    fileName: '2026-04.sample.md',
    body: `---
title: "2026-04 月报样例"
type: journal
journal_type: monthly
journal_date: 2026-04-01
month_start: 2026-04-01
month_end: 2026-04-30
year_id: "2026"
month_id: 2026-04
status: draft
publish: true
sample: true
highlight: 这是按照月报模板生成的展示样例，用来检查月度复盘结构和页面呈现
next_focus: 后续真实月报可以替换这份样例，并沿用同样的视觉结构
tags:
  - journal
  - journal/monthly
---

# 2026-04 月报样例

> [!tip] 文件命名与字段
> - 文件名统一用：\`2026-04\`
> - \`journal_date\`：写本月第一天
> - \`month_start / month_end\`：分别写月初和月末
> - \`month_id\`：写成 \`2026-04\` 这种格式
> - 这份样例会进入加密 payload，只用于查看月报结构，不代表真实月报。

> [!summary] 本月概览（1日至月末）
> - 这个月最想记住的：四月的主线是考研复习开始变得更具体，数据结构、计网、高数和现实任务交替推进。
> - 这个月的整体感觉：前半段节奏逐渐建立，后半段被统计建模、课程答辩和生活事件反复打断。
> - 这里不必写满，留空也可以；页面需要能承载这种“概览 + 回看 + 主线”的月度结构。

## 本月日报回看

![[复盘/查询视图/月报-日报回顾.base]]

## 本月周报回看

![[复盘/查询视图/月报-周报回顾.base]]

## 技术相关

这个月技术相关内容主要分散在日常学习、AI 工具体验和一些前端复刻实验里。它不是一份正式技术总结，更像是记录“哪些东西吸引了注意力、哪些工具真的帮上忙”。

## 考研学习相关

数据结构逐步推进到图和查找，计算机网络也开始进入更重的章节。真正值得关注的是复习节奏的稳定性，而不只是某一天学了多少小时。

## 日常生活相关

四月生活线比较有戏剧性：吃饭、理发翻车、课程任务、比赛压力，以及偶尔被 AI 生图骗到一堆人的小快乐，都混在一起。

## 补充

月报页面需要能承载“概览、回看、三条主线、补充、AI 评价”这一套结构，同时不要显得像技术博客文章。

---

## AI 评价

> [!note] 这部分由 AI 生成
> 这是一段样例评价。它应该显得像一个嘴有点毒但认真旁观的人，而不是一本正经的述职报告。
`,
  },
  yearly: {
    fileName: '2026.sample.md',
    body: `---
title: "2026 年报样例"
type: journal
journal_type: yearly
journal_date: 2026-01-01
year_start: 2026-01-01
year_end: 2026-12-31
year_id: "2026"
status: draft
publish: true
sample: true
highlight: 这是按照年报模板生成的展示样例，用来检查年度复盘结构和页面呈现
next_focus: 后续真实年报可以替换这份样例，并沿用同样的视觉结构
tags:
  - journal
  - journal/yearly
---

# 2026 年报样例

> [!tip] 文件命名与字段
> - 文件名统一用：\`2026\`
> - \`journal_date\`：写本年第一天
> - \`year_start / year_end\`：分别写 \`YYYY-01-01 / YYYY-12-31\`
> - \`year_id\`：写成 \`2026\` 这种格式
> - 这份样例会进入加密 payload，只用于查看年报结构，不代表真实年报。

> [!summary] 本年概览（1月1日至12月31日）
> - 这一年最想记住的：这是年报结构展示样例，用来测试年度维度的长内容承载。
> - 这一年的整体感觉：年度复盘需要比日报和周报更克制，更像回看轨迹，而不是堆砌流水账。
> - 这里不必写满，留空也可以；页面需要能承载这种“年度轨迹 + 长期模式”的结构。

## 本年月报回看

![[复盘/查询视图/年报月报.base]]

## 本年周报回看

![[复盘/查询视图/年报周报.base]]

## 技术相关

年度技术线应当强调方向变化、工具选择和长期判断，而不是把每一次技术尝试都重新列一遍。

## 考研学习相关

年度学习线适合看长期节奏：哪些阶段推进得最稳，哪些阶段最容易被现实任务打断，哪些知识点真正形成了复利。

## 日常生活相关

年度生活线更适合保留少量高密度片段：一些改变节奏的人和事，一些反复出现的情绪模式，以及身体和精力状态的长期变化。

## 补充

年报页面需要让内容显得更“年度”，而不是把月报放大一号。

---

## AI 评价

> [!note] 这部分由 AI 生成
> 这是一段样例评价。年度评价应该更像长期观察，不要只复述数据。
`,
  },
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function copyMarkdownGroup(group) {
  const sourceDir = path.join(sourceRoot, group.source)
  const targetDir = path.join(targetRoot, group.target)
  ensureDir(targetDir)

  if (!fs.existsSync(sourceDir)) {
    console.warn(`[journal:sync] Missing source directory: ${sourceDir}`)
    return 0
  }

  const files = fs
    .readdirSync(sourceDir)
    .filter((fileName) => fileName.endsWith('.md'))
    .sort((a, b) => a.localeCompare(b))

  for (const fileName of files) {
    fs.copyFileSync(path.join(sourceDir, fileName), path.join(targetDir, fileName))
  }

  return files.length
}

function writeSampleReports() {
  for (const group of Object.keys(sampleReports)) {
    const targetDir = path.join(targetRoot, group)
    if (!fs.existsSync(targetDir)) {
      continue
    }

    for (const fileName of fs.readdirSync(targetDir)) {
      if (fileName.endsWith('.sample.md')) {
        fs.unlinkSync(path.join(targetDir, fileName))
      }
    }
  }

  for (const [group, sample] of Object.entries(sampleReports)) {
    const targetDir = path.join(targetRoot, group)
    ensureDir(targetDir)
    const targetPath = path.join(targetDir, sample.fileName)

    fs.writeFileSync(targetPath, sample.body, 'utf8')
  }
}

ensureDir(targetRoot)

const copied = groups.map((group) => ({
  group: group.target,
  count: copyMarkdownGroup(group),
}))

writeSampleReports()

console.log('[journal:sync] Synced private journals into ignored local content:')
for (const item of copied) {
  console.log(`  - ${item.group}: ${item.count} file(s)`)
}
console.log(`[journal:sync] Target: ${targetRoot}`)
