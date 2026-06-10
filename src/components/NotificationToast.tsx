import { AnimatePresence, motion } from 'framer-motion'
import { BellRing } from 'lucide-react'

export interface NotificationItem {
  id: string
  type: 'New Alert' | 'Report Verified' | 'Report Resolved' | 'Announcement Posted'
  title: string
  message: string
  created_at: string
}

interface NotificationToastProps {
  notification: NotificationItem | null
}

export default function NotificationToast({ notification }: NotificationToastProps) {
  return (
    <AnimatePresence>
      {notification ? (
        <motion.div
          className="notification-toast"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 32 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <BellRing size={18} />
          <div>
            <p className="toast-title">{notification.type}</p>
            <small>{notification.message}</small>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
