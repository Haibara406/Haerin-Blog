import { getAllPosts } from './posts'

export function getBlogStats() {
  const posts = getAllPosts()

  // 计算总字数
  const totalWords = posts.reduce((sum, post) => {
    // 简单估算：每篇文章摘要约 100 字，实际内容需要读取文件
    return sum + (post.excerpt?.length || 0) * 10
  }, 0)

  // 计算总标签数
  const allTags = new Set<string>()
  posts.forEach(post => {
    post.tags?.forEach(tag => allTags.add(tag))
  })

  return {
    totalPosts: posts.length,
    totalWords: Math.round(totalWords / 1000) * 1000, // 四舍五入到千位
    totalTags: allTags.size,
    totalCategories: new Set(posts.map(p => p.category)).size,
  }
}