import { motion, AnimatePresence } from 'framer-motion'
import { Bell } from 'lucide-react'
import type { EmergencyAlert } from '../lib/alerts'

interface AlertToastProps {
  alert: EmergencyAlert | null
}

export default function AlertToast({ alert }: AlertToastProps) {
  return (
    <AnimatePresence>
      {alert ? (
        <motion.div
          className="alert-toast"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 32 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <Bell size={18} />
          <div>
            <p className="toast-title">{alert.alert_type} alert active</p>
            <small>{alert.title}</small>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
