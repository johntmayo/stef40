'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { getUserName, logout } from '@/lib/auth'

const NAV_ITEMS = [
  { path: '/canopy', label: 'Canopy' },
  { path: '/root-system', label: 'Root System' },
  { path: '/forest-path', label: 'Forest Path' },
  { path: '/whispering-wall', label: 'Whispering Wall' },
]

export default function Navigation() {
  const pathname = usePathname()
  const [userName, setUserName] = useState<string | null>(null)
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    setUserName(getUserName())
  }, [])

  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  // Don't show nav on entry page
  if (pathname === '/') return null

  const isAdmin = userName === 'Stef'
  const googleSheetUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEET_URL || 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID'

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-moss-deep/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/canopy" className="text-xl font-serif text-moss-deep">
            The Redwood Portal
          </Link>

          <div className="flex items-center gap-6">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`
                    text-sm font-medium transition-colors
                    ${pathname === item.path
                      ? 'text-moss-deep border-b-2 border-moss-deep'
                      : 'text-moss-deep/60 hover:text-moss-deep'
                    }
                  `}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Admin Icon */}
            {isAdmin && (
              <a
                href={googleSheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-moss-deep/60 hover:text-moss-deep transition-colors"
                title="Admin: Edit Google Sheet"
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
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </a>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="text-sm text-moss-deep/60 hover:text-moss-deep transition-colors"
            >
              Exit Grove
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="md:hidden text-moss-deep"
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
                className={`
                  block py-2 text-sm font-medium transition-colors
                  ${pathname === item.path
                    ? 'text-moss-deep'
                    : 'text-moss-deep/60'
                  }
                `}
              >
                {item.label}
              </Link>
            ))}
          </motion.div>
        )}
      </div>
    </nav>
  )
}

