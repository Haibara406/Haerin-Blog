import { getBlogStats } from '@/lib/stats'
import AboutClient from '@/components/AboutClient'

export default function About() {
  const stats = getBlogStats()

  return <AboutClient stats={stats} />
}