import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import type { EmergencyAlert } from '../lib/alerts'

interface AlertBannerProps {
  alert: EmergencyAlert | null
}

export default function AlertBanner({ alert }: AlertBannerProps) {
  if (!alert) {
    return null
  }

  return (
    <motion.div
      className={`alert-banner ${alert.critical ? 'critical' : ''}`}
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <AlertTriangle size={20} />
      <div>
        <strong>{alert.alert_type} Alert</strong>
        <p>{alert.title}</p>
      </div>
    </motion.div>
  )
}
