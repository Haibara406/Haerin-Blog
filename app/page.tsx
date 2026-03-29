import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'
import BlogCard from '@/components/BlogCard'
import HomeClient from '@/components/HomeClient'

export default function Home() {
  const posts = getAllPosts()

  return <HomeClient posts={posts} />
}
