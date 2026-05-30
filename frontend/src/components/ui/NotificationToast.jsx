import { motion, AnimatePresence } from 'framer-motion'
import { Zap, X, CheckCircle, AlertTriangle } from 'lucide-react'

export default function NotificationToast({ notifications, dismiss }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm">
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-[#0f0f18] border border-[#7F77DD]/20 rounded-xl p-4 shadow-2xl flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-[#7F77DD]/15 flex items-center justify-center flex-shrink-0">
              {notif.type === 'review_complete'
                ? <Zap size={15} className="text-[#7F77DD]" />
                : <CheckCircle size={15} className="text-[#5DCAA5]" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#c8c8dd]">{notif.title}</p>
              <p className="text-xs text-[#8a8a9a] mt-0.5">{notif.message}</p>
              {notif.score && (
                <span className="inline-block mt-1.5 text-xs bg-[#5DCAA5]/10 text-[#5DCAA5] px-2 py-0.5 rounded-full">
                  Score: {notif.score}/10
                </span>
              )}
            </div>
            <button
              onClick={() => dismiss(notif.id)}
              className="text-[#8a8a9a] hover:text-[#c8c8dd] transition-colors flex-shrink-0"
            >
              <X size={13} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}