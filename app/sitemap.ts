import { getAllPosts } from '@/lib/posts'

export default function sitemap() {
  const posts = getAllPosts()
  const baseUrl = 'https://haerin.haikari.top'

  const postUrls = posts.map((post) => ({
    url: `${baseUrl}/post/${encodeURIComponent(post.slug)}`,
    lastModified: post.updated || post.date,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const routes = ['', '/about', '/archive', '/tags'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.9,
  }))

  return [...routes, ...postUrls]
}
