import type { Metadata } from 'next'
import JournalPageClient from '@/components/JournalPageClient'

export const metadata: Metadata = {
  title: 'Journal',
  description: 'Private personal journal entries protected with client-side encryption.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default function JournalPage() {
  return <JournalPageClient />
}
