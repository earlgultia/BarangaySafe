import React from 'react'
import { Sun, Moon, Laptop } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import './ThemeToggle.css'

export function ThemeToggle() {
  const { theme, effectiveTheme, setTheme } = useTheme()

  const toggleOptions: Array<'light' | 'dark' | 'auto'> = ['light', 'dark', 'auto']
  const currentIndex = toggleOptions.indexOf(theme)
  const nextTheme = toggleOptions[(currentIndex + 1) % toggleOptions.length]

  const getIcon = () => {
    if (effectiveTheme === 'dark') {
      return <Moon size={20} />
    }
    return <Sun size={20} />
  }

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light'
      case 'dark':
        return 'Dark'
      case 'auto':
        return 'Auto'
      default:
        return 'Theme'
    }
  }

  return (
    <button
      className="theme-toggle"
      onClick={() => setTheme(nextTheme)}
      title={`Switch to ${nextTheme} mode`}
      aria-label={`Theme: ${getLabel()}`}
    >
      <div className="theme-toggle-icon">
        {getIcon()}
      </div>
      <span className="theme-toggle-label">{getLabel()}</span>
    </button>
  )
}

export default ThemeToggle
