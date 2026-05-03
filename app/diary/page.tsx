import { Suspense } from 'react'
import type { Metadata } from 'next'
import DiaryPageClient from '@/components/DiaryPageClient'

export const metadata: Metadata = {
  title: 'Diary',
  description: 'A notebook-style diary adapted to the Haerin Blog aesthetic with editable daily entries.',
}

export default function DiaryPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-24">
          <div className="animate-pulse rounded-[2rem] border border-gray-200 bg-white/80 p-8 dark:border-gray-800 dark:bg-gray-950/60">
            <div className="h-4 w-32 rounded-full bg-gray-200 dark:bg-gray-800" />
            <div className="mt-6 h-16 w-full max-w-3xl rounded-[1.5rem] bg-gray-200 dark:bg-gray-800" />
            <div className="mt-6 h-24 w-full rounded-[1.5rem] bg-gray-100 dark:bg-gray-900" />
          </div>
        </div>
      }
    >
      <DiaryPageClient />
    </Suspense>
  )
}
