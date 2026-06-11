import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'auto'

interface ThemeContextType {
  theme: Theme
  effectiveTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme | null
    return stored || 'auto'
  })

  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>(() => {
    if (theme === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return theme as 'light' | 'dark'
  })

  useEffect(() => {
    // Update effective theme when theme preference changes
    const newEffective =
      theme === 'auto'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : (theme as 'light' | 'dark')

    setEffectiveTheme(newEffective)

    // Update HTML class and CSS variables
    const html = document.documentElement
    html.classList.remove('light', 'dark')
    html.classList.add(newEffective)

    // Update CSS variables for theme colors
    if (newEffective === 'dark') {
      html.style.setProperty('--bg', '#0f1419')
      html.style.setProperty('--bg-soft', '#1a1f28')
      html.style.setProperty('--surface', '#252d38')
      html.style.setProperty('--surface-muted', '#1f2733')
      html.style.setProperty('--surface-strong', '#0f1419')
      html.style.setProperty('--text', '#e8eaed')
      html.style.setProperty('--text-muted', '#9aa0a6')
      html.style.setProperty('--text-h', '#ffffff')
      html.style.setProperty('--card-bg', '#1a1f28')
      html.style.setProperty('--border', '#2d3748')
    } else {
      html.style.setProperty('--bg', '#fafbfc')
      html.style.setProperty('--bg-soft', '#f3f4f6')
      html.style.setProperty('--surface', '#ffffff')
      html.style.setProperty('--surface-muted', '#f8f9fa')
      html.style.setProperty('--surface-strong', '#f3f4f6')
      html.style.setProperty('--text', '#1a1a1a')
      html.style.setProperty('--text-muted', '#666666')
      html.style.setProperty('--text-h', '#000000')
      html.style.setProperty('--card-bg', '#ffffff')
      html.style.setProperty('--border', '#e5e7eb')
    }
  }, [theme])

  // Listen for system theme changes when set to 'auto'
  useEffect(() => {
    if (theme !== 'auto') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      setEffectiveTheme(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])


  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  const toggleTheme = () => {
    setTheme(effectiveTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <ThemeContext.Provider value={{ theme, effectiveTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

export default ThemeContext
