'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type Theme = 'light' | 'dusk' | 'dark'

const THEME_KEY = 'redwood_theme'

const ThemeContext = createContext<{
  theme: Theme
  setTheme: (t: Theme) => void
}>({ theme: 'light', setTheme: () => {} })

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY) as Theme | null
    if (stored && ['light', 'dusk', 'dark'].includes(stored)) {
      setThemeState(stored)
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || typeof document === 'undefined') return
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_KEY, theme)
  }, [theme, mounted])

  const setTheme = (t: Theme) => setThemeState(t)

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
