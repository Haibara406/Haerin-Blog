'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import ThemeToggle from './ThemeToggle'
import LanguageToggle from './LanguageToggle'
import SearchModal from './SearchModal'
import { useLanguage } from './LanguageProvider'

export default function Navigation() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Show/hide based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setHidden(true)
      } else {
        setHidden(false)
      }

      // Background blur effect
      setScrolled(currentScrollY > 50)
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/archive', label: t('nav.archive') },
    { href: '/tags', label: t('nav.tags') },
    { href: '/friends', label: t('nav.friends') },
    { href: '/about', label: t('nav.about') },
  ]

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800'
            : 'bg-transparent'
        } ${hidden ? '-translate-y-full' : 'translate-y-0'}`}
      >
        <div className="w-full px-4 sm:px-6 py-5">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center">
            {/* Logo - 左侧，更大 */}
            <Link
              href="/"
              className="justify-self-start font-serif text-4xl font-light tracking-tight hover:opacity-60 transition-opacity duration-200"
            >
              Haerin
            </Link>

            {/* Navigation Links - 中间 */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm transition-all duration-200 hover:opacity-100 relative ${
                    pathname === link.href
                      ? 'opacity-100 after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[1px] after:bg-current'
                      : 'opacity-60 hover:after:w-full after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-current after:transition-all after:duration-300'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Action Buttons - 右侧 */}
            <div className="hidden md:flex items-center justify-self-end gap-3">
              {/* Search Button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center
                         hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                aria-label="Search"
                title="Search (⌘K)"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>

              <LanguageToggle />
              <ThemeToggle />
            </div>

            {/* Mobile Menu */}
            <div className="flex md:hidden items-center justify-self-end gap-3">
              <button
                onClick={() => setSearchOpen(true)}
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
                aria-label="Search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
