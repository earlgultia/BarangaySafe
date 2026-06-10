import { motion, AnimatePresence } from 'framer-motion'
import { XCircle, AlertCircle } from 'lucide-react'
import type { EmergencyAlert } from '../lib/alerts'

interface FullscreenAlertModalProps {
  alert: EmergencyAlert | null
  open: boolean
  onDismiss: () => void
}

export default function FullscreenAlertModal({ alert, open, onDismiss }: FullscreenAlertModalProps) {
  if (!alert) {
    return null
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fullscreen-alert-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="fullscreen-alert-modal"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <div className="modal-icon">
              <AlertCircle size={42} />
            </div>
            <h2>Critical Alert</h2>
            <p className="modal-type">{alert.alert_type}</p>
            <h3>{alert.title}</h3>
            <p>{alert.description}</p>
            <button type="button" className="modal-dismiss" onClick={onDismiss}>
              <XCircle size={16} /> Acknowledge
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
