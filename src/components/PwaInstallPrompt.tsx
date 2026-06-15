import { AnimatePresence, motion } from 'framer-motion'
import { Download, X } from 'lucide-react'
import { useEffect, useState } from 'react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const STORAGE_KEY = 'pwa-install-state'

function isInstalled() {
  if (typeof window === 'undefined') return true

  const standalone = window.matchMedia('(display-mode: standalone)').matches
  const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean }

  return standalone || navigatorWithStandalone.standalone === true
}

export default function PwaInstallPrompt() {
  const [open, setOpen] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const storedState = window.localStorage.getItem(STORAGE_KEY)
    if (storedState === 'installed' || storedState === 'dismissed' || isInstalled()) {
      if (isInstalled()) {
        window.localStorage.setItem(STORAGE_KEY, 'installed')
      }
      return
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
      setOpen(true)
    }

    const handleAppInstalled = () => {
      window.localStorage.setItem(STORAGE_KEY, 'installed')
      setOpen(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    const timer = window.setTimeout(() => {
      const currentState = window.localStorage.getItem(STORAGE_KEY)
      if (!currentState && !isInstalled()) {
        setOpen(true)
      }
    }, 1200)

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  function dismissPrompt() {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, 'dismissed')
    }
    setOpen(false)
  }

  async function handleInstall() {
    if (!deferredPrompt) {
      dismissPrompt()
      return
    }

    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice

    if (choice.outcome === 'accepted') {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, 'installed')
      }
    } else {
      dismissPrompt()
    }

    setOpen(false)
    setDeferredPrompt(null)
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="logout-confirm-overlay pwa-install-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.div
            className="logout-confirm-modal pwa-install-modal"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <button type="button" className="pwa-install-close" onClick={dismissPrompt} aria-label="Close install prompt">
              <X size={16} />
            </button>
            <div className="pwa-install-icon">
              <Download size={24} />
            </div>
            <h3>Install eAmping?</h3>
            <p className="muted">Get fast access from your home screen and keep important alerts nearby.</p>
            <div className="confirm-actions">
              <button type="button" className="button-outline" onClick={dismissPrompt}>Later</button>
              <button type="button" className="submit-button" onClick={() => { void handleInstall() }}>Install</button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
