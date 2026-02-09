'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { getUserName, logout, STEF_ADMIN_NAME } from '@/lib/auth'
import { useTheme, type Theme } from '@/components/ThemeProvider'

const NAV_ITEMS = [
  { path: '/canopy', label: 'Dashboard' },
  { path: '/info', label: 'Info' },
  { path: '/root-system', label: 'RSVPs' },
  { path: '/forest-path', label: 'Itinerary' },
  { path: '/whispering-wall', label: 'Guestbook' },
]

const THEMES: { value: Theme; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dusk', label: 'Dusk' },
  { value: 'dark', label: 'Dark' },
]

export default function Navigation() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [userName, setUserName] = useState<string | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [showThemeMenu, setShowThemeMenu] = useState(false)

  useEffect(() => {
    setUserName(getUserName())
  }, [])

  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  // Don't show nav on entry page
  if (pathname === '/') return null

  const isAdmin = userName === STEF_ADMIN_NAME
  const googleSheetUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEET_URL || 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID'

  return (
    <nav className="theme-card border-b sticky top-0 z-50 bg-opacity-80 backdrop-blur-sm" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/canopy" className="text-xl font-serif" style={{ color: 'var(--page-text)' }}>
            The Redwood Portal
          </Link>

          <div className="flex items-center gap-4 md:gap-6">
            {/* Theme toggle */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="p-2 rounded-md transition-colors hover:opacity-80"
                style={{ color: 'var(--page-text)' }}
                title="Theme"
                aria-label="Toggle theme"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343L12.657 5.686a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </button>
              {showThemeMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowThemeMenu(false)} aria-hidden="true" />
                  <div
                    className="absolute right-0 top-full mt-1 py-1 rounded-md shadow-lg z-50 min-w-[100px]"
                    style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
                  >
                    {THEMES.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => { setTheme(t.value); setShowThemeMenu(false) }}
                        className="block w-full text-left px-4 py-2 text-sm hover:opacity-80"
                        style={{ color: 'var(--page-text)' }}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className="text-sm font-medium transition-colors opacity-80 hover:opacity-100"
                  style={{
                    color: 'var(--page-text)',
                    ...(pathname === item.path ? { borderBottom: '2px solid currentColor' } : {}),
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Admin link */}
            {isAdmin && (
              <Link
                href="/admin"
                className="opacity-80 hover:opacity-100 transition-opacity"
                style={{ color: 'var(--page-text)' }}
                title="Admin"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Link>
            )}
            {isAdmin && (
              <a
                href={googleSheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-80 hover:opacity-100 transition-opacity"
                style={{ color: 'var(--page-text)' }}
                title="Open spreadsheet"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </a>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="text-sm opacity-80 hover:opacity-100 transition-opacity"
              style={{ color: 'var(--page-text)' }}
            >
              Exit Grove
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="md:hidden"
              style={{ color: 'var(--page-text)' }}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {showMenu ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-4 space-y-2"
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setShowMenu(false)}
                className="block py-2 text-sm font-medium opacity-80 hover:opacity-100"
                style={{ color: 'var(--page-text)' }}
              >
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <Link href="/admin" onClick={() => setShowMenu(false)} className="block py-2 text-sm font-medium opacity-80 hover:opacity-100" style={{ color: 'var(--page-text)' }}>
                Admin
              </Link>
            )}
          </motion.div>
        )}
      </div>
    </nav>
  )
}

