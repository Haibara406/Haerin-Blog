import './globals.css'
import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { ThemeProvider } from '@/components/ThemeProvider'
import { LanguageProvider } from '@/components/LanguageProvider'
import { PageTransitionProvider } from '@/components/PageTransitionProvider'

export const metadata: Metadata = {
  title: {
    default: 'Haerin Blog',
    template: '%s | Haerin Blog',
  },
  description: 'A minimalist personal blog about design, code, and craft',
  keywords: ['blog', 'design', 'code', 'programming', 'web development'],
  authors: [{ name: 'Haerin' }],
  creator: 'Haerin',
  publisher: 'Haerin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  manifest: '/site.webmanifest',
  referrer: 'no-referrer',
  metadataBase: new URL('https://haerin.haikari.top'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://haerin.haikari.top',
    title: 'Haerin Blog',
    description: 'A minimalist personal blog about design, code, and craft',
    siteName: 'Haerin Blog',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Haerin Blog',
    description: 'A minimalist personal blog about design, code, and craft',
    creator: '@haibara406',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="referrer" content="no-referrer" />
      </head>
      <body>
        <ThemeProvider>
          <LanguageProvider>
            <PageTransitionProvider>
              <Navigation />
              <main className="min-h-screen">
                {children}
              </main>
              <Footer />
            </PageTransitionProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
