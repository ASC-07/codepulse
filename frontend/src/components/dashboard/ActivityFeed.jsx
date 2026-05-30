import { motion } from 'framer-motion'

const activities = [
  { color: '#7F77DD', title: 'AI flagged SQL injection risk', sub: 'in PR #338 · 2 min ago' },
  { color: '#5DCAA5', title: 'Priya merged PR #340', sub: 'into main · 4h ago' },
  { color: '#FAC775', title: 'CI pipeline failed', sub: 'on feature/kafka · 5h ago' },
  { color: '#7F77DD', title: 'AI generated sprint summary', sub: 'emailed to team · Yesterday' },
  { color: '#5DCAA5', title: 'Rohan opened PR #339', sub: 'dependency upgrade · Yesterday' },
]

export default function ActivityFeed() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="bg-[#0f0f18] border border-[#7F77DD]/10 rounded-xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-[#c8c8dd]">Activity feed</h3>
        <button className="text-xs text-[#7F77DD] hover:text-[#afa9ec] transition-colors">All →</button>
      </div>
      <div className="space-y-0">
        {activities.map((a, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.07 }}
            className="flex gap-3 py-2.5"
          >
            <div className="flex flex-col items-center pt-1">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: a.color }} />
              {i < activities.length - 1 && (
                <div className="w-px flex-1 bg-[#7F77DD]/08 mt-1" />
              )}
            </div>
            <div className="pb-2">
              <div className="text-sm text-[#c8c8dd]">{a.title}</div>
              <div className="text-xs text-[#8a8a9a] mt-0.5">{a.sub}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}