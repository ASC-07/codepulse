import { Bell, RefreshCw, Search } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Topbar({ title, subtitle }) {
  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-between px-6 py-4 border-b border-[#7F77DD]/10 bg-[#0a0a0f] sticky top-0 z-10"
    >
      <div>
        <h1 className="text-base font-medium text-[#e8e8f0]">{title}</h1>
        <p className="text-xs text-[#8a8a9a] mt-0.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-[#5DCAA5] rounded-full inline-block animate-pulse"></span>
          {subtitle || 'Live · Updated just now'}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-[#7F77DD]/07 border border-[#7F77DD]/15 rounded-lg px-3 py-2">
          <Search size={13} className="text-[#8a8a9a]" />
          <input
            placeholder="Search PRs, repos..."
            className="bg-transparent text-sm text-[#c8c8dd] outline-none w-40 placeholder:text-[#ffffff25]"
          />
        </div>
        <button className="relative w-8 h-8 rounded-lg bg-[#7F77DD]/07 border border-[#7F77DD]/15 flex items-center justify-center text-[#8a8a9a] hover:text-[#afa9ec] transition-colors">
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#7F77DD] rounded-full"></span>
        </button>
        <button className="w-8 h-8 rounded-lg bg-[#7F77DD]/07 border border-[#7F77DD]/15 flex items-center justify-center text-[#8a8a9a] hover:text-[#afa9ec] transition-colors">
          <RefreshCw size={14} />
        </button>
      </div>
    </motion.header>
  )
}