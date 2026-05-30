import { motion } from 'framer-motion'
import Badge from '../ui/Badge'
import { Zap } from 'lucide-react'

const mockPRs = [
  { id: '#341', title: 'feat: add Redis caching layer to auth service', author: 'Arjun Kumar', time: '2h ago', diff: '+342 −18', status: 'review', aiReview: '2 suggestions' },
  { id: '#340', title: 'fix: resolve N+1 query in user dashboard', author: 'Priya Nair', time: '4h ago', diff: '+28 −91', status: 'merged', aiReview: 'clean' },
  { id: '#339', title: 'chore: upgrade dependencies to latest', author: 'Rohan Mehta', time: '6h ago', diff: '+4 −4', status: 'open', aiReview: '1 warning' },
  { id: '#338', title: 'feat: Kafka consumer for notification events', author: 'Sneha Das', time: '8h ago', diff: '+218 −12', status: 'failed', aiReview: '4 issues' },
]

const statusConfig = {
  review:  { label: 'In Review', variant: 'amber' },
  merged:  { label: 'Merged',    variant: 'green' },
  open:    { label: 'Open',      variant: 'purple' },
  failed:  { label: 'CI Failed', variant: 'red' },
}

export default function PRList() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-[#0f0f18] border border-[#7F77DD]/10 rounded-xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-[#c8c8dd]">Recent pull requests</h3>
        <button className="text-xs text-[#7F77DD] hover:text-[#afa9ec] transition-colors">View all →</button>
      </div>
      <div className="space-y-0">
        {mockPRs.map((pr, i) => (
          <motion.div
            key={pr.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.08 }}
            className="flex items-center gap-3 py-3 border-b border-[#7F77DD]/06 last:border-0 hover:bg-[#7F77DD]/03 rounded-lg px-2 -mx-2 cursor-pointer transition-colors"
          >
            <div className="text-xs text-[#ffffff25] w-9 font-mono flex-shrink-0">{pr.id}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-[#c8c8dd] truncate">{pr.title}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] text-[#8a8a9a]">{pr.author} · {pr.time} · {pr.diff}</span>
                <span className="flex items-center gap-1 text-[10px] text-[#7F77DD] bg-[#7F77DD]/08 px-1.5 py-0.5 rounded-full">
                  <Zap size={9} />
                  {pr.aiReview}
                </span>
              </div>
            </div>
            <Badge variant={statusConfig[pr.status].variant}>
              {statusConfig[pr.status].label}
            </Badge>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}