import { motion } from 'framer-motion'
import { GitPullRequest, Zap, Clock, Bug } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'
import Topbar from '../components/layout/Topbar'
import MetricCard from '../components/dashboard/MetricCard'
import PRList from '../components/dashboard/PRList'
import ActivityFeed from '../components/dashboard/ActivityFeed'

const metrics = [
  {
    icon: <GitPullRequest size={16} />,
    label: 'Total PRs this month',
    value: '248',
    change: '+12%',
    changeType: 'up',
    delay: 0.1,
    bars: [40,55,45,65,50,70,60,80,65,85,75,90],
  },
  {
    icon: <Zap size={16} />,
    label: 'AI review accuracy',
    value: '94%',
    change: '+8%',
    changeType: 'up',
    delay: 0.2,
    bars: [60,58,65,62,70,75,68,80,72,82,78,86],
  },
  {
    icon: <Clock size={16} />,
    label: 'Avg. merge time',
    value: '1.4h',
    change: '-23%',
    changeType: 'down',
    delay: 0.3,
    bars: [80,72,68,74,60,65,55,58,50,52,45,48],
  },
  {
    icon: <Bug size={16} />,
    label: 'Issues caught by AI',
    value: '37',
    change: '+5%',
    changeType: 'up',
    delay: 0.4,
    bars: [20,30,25,35,28,40,32,45,36,50,40,55],
  },
]

export default function Dashboard() {
  return (
    <AppLayout>
      <Topbar title="Dashboard" />
      <main className="p-6 space-y-5">
        {/* Metrics */}
        <div className="grid grid-cols-4 gap-4">
          {metrics.map((m, i) => (
            <MetricCard key={i} {...m} />
          ))}
        </div>

        {/* PR List + Activity */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <PRList />
          </div>
          <div>
            <ActivityFeed />
          </div>
        </div>

        {/* Bottom banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-[#7F77DD]/10 to-[#5DCAA5]/05 border border-[#7F77DD]/15 rounded-xl p-5 flex items-center justify-between"
        >
          <div>
            <div className="text-sm font-medium text-[#c8c8dd]">Connect your first repository</div>
            <div className="text-xs text-[#8a8a9a] mt-1">Link a GitHub repo to start getting AI-powered code reviews on every PR</div>
          </div>
          <button className="bg-[#7F77DD] hover:bg-[#6a63cc] text-white text-sm px-4 py-2 rounded-lg transition-colors flex-shrink-0">
            Connect repo →
          </button>
        </motion.div>
      </main>
    </AppLayout>
  )
}