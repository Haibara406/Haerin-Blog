import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkHtml from 'remark-html'
import remarkGfm from 'remark-gfm'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeStringify from 'rehype-stringify'
import rehypeRaw from 'rehype-raw'

const postsDirectory = path.join(process.cwd(), 'content/posts')

export interface Post {
  slug: string
  title: string
  date: string
  excerpt: string
  content: string
  tags?: string[]
  category?: string
}

export interface TableOfContents {
  id: string
  text: string
  level: number
}

export function getAllPosts(): Omit<Post, 'content'>[] {
  if (!fs.existsSync(postsDirectory)) {
    return []
  }

  const fileNames = fs.readdirSync(postsDirectory)
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '')
      const fullPath = path.join(postsDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data } = matter(fileContents)

      return {
        slug,
        title: data.title || '',
        date: data.date || '',
        excerpt: data.excerpt || '',
        tags: data.tags || [],
        category: data.category || 'Uncategorized',
      }
    })

  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getPostBySlug(slug: string): Post | null {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)

    const processedContent = unified()
      .use(remarkParse)
      .use(remarkGfm) // 支持 GFM（表格、删除线、任务列表等）
      .use(remarkRehype, { allowDangerousHtml: true }) // 允许 HTML
      .use(rehypeRaw) // 处理原始 HTML
      .use(rehypeSlug) // 为标题添加 ID
      // 移除 rehypeAutolinkHeadings，不自动添加链接
      .use(rehypeHighlight)
      .use(rehypeStringify)
      .processSync(content)

    const contentHtml = processedContent.toString()

    return {
      slug,
      title: data.title || '',
      date: data.date || '',
      excerpt: data.excerpt || '',
      content: contentHtml,
      tags: data.tags || [],
      category: data.category || 'Uncategorized',
    }
  } catch (error) {
    return null
  }
}

export function extractTableOfContents(content: string): TableOfContents[] {
  const headingRegex = /^(#{1,3})\s+(.+)$/gm
  const toc: TableOfContents[] = []
  let match

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')

    toc.push({ id, text, level })
  }

  return toc
}

export function getAllTags(): { tag: string; count: number }[] {
  const posts = getAllPosts()
  const tagCount: Record<string, number> = {}

  posts.forEach((post) => {
    post.tags?.forEach((tag) => {
      tagCount[tag] = (tagCount[tag] || 0) + 1
    })
  })

  return Object.entries(tagCount)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
}

export function getAllCategories(): { category: string; count: number }[] {
  const posts = getAllPosts()
  const categoryCount: Record<string, number> = {}

  posts.forEach((post) => {
    const category = post.category || 'Uncategorized'
    categoryCount[category] = (categoryCount[category] || 0) + 1
  })

  return Object.entries(categoryCount)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
}

export function getPostsByTag(tag: string): Omit<Post, 'content'>[] {
  return getAllPosts().filter((post) => post.tags?.includes(tag))
}

export function getPostsByCategory(category: string): Omit<Post, 'content'>[] {
  return getAllPosts().filter((post) => post.category === category)
}

export function getArchive(): Record<string, Omit<Post, 'content'>[]> {
  const posts = getAllPosts()
  const archive: Record<string, Omit<Post, 'content'>[]> = {}

  posts.forEach((post) => {
    const year = post.date.split('-')[0]
    if (!archive[year]) {
      archive[year] = []
    }
    archive[year].push(post)
  })

  return archive
}
