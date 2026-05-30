import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function MetricCard({ icon, label, value, change, changeType, delay = 0, bars }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-[#0f0f18] border border-[#7F77DD]/10 rounded-xl p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-8 h-8 rounded-lg bg-[#7F77DD]/10 flex items-center justify-center text-[#afa9ec]">
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
          changeType === 'up'
            ? 'bg-[#5DCAA5]/10 text-[#5DCAA5]'
            : 'bg-[#F09595]/10 text-[#F09595]'
        }`}>
          {changeType === 'up' ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {change}
        </div>
      </div>
      <div className="text-2xl font-semibold text-[#e8e8f0] mb-1">{value}</div>
      <div className="text-xs text-[#8a8a9a]">{label}</div>
      {bars && (
        <div className="flex items-end gap-0.5 h-8 mt-3">
          {bars.map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ duration: 0.6, delay: delay + i * 0.03 }}
              className="flex-1 bg-[#7F77DD]/30 rounded-sm"
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}