import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart,
  Pie, Cell, Legend
} from 'recharts'
import AppLayout from '../components/layout/AppLayout'
import Topbar from '../components/layout/Topbar'
import { getSummary, getReviewsTrend } from '../api/analytics'
import { Zap, GitBranch, Star, AlertTriangle } from 'lucide-react'

const COLORS = {
  critical: '#F09595',
  high: '#FAC775',
  medium: '#afa9ec',
  low: '#5DCAA5',
}

function StatCard({ icon, label, value, sub, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-[#0f0f18] border border-[#7F77DD]/10 rounded-xl p-5"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-[#7F77DD]/10 flex items-center justify-center text-[#afa9ec]">
          {icon}
        </div>
        <span className="text-xs text-[#8a8a9a]">{label}</span>
      </div>
      <div className="text-3xl font-semibold text-[#e8e8f0]">{value}</div>
      {sub && <div className="text-xs text-[#8a8a9a] mt-1">{sub}</div>}
    </motion.div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0f0f18] border border-[#7F77DD]/20 rounded-lg p-3 text-xs">
      <p className="text-[#c8c8dd] font-medium mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

export default function Analytics() {
  const [summary, setSummary] = useState(null)
  const [trend, setTrend] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getSummary(), getReviewsTrend()])
      .then(([s, t]) => {
        setSummary(s.data)
        setTrend(t.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <AppLayout>
      <Topbar title="Analytics" />
      <div className="flex items-center justify-center flex-1 py-20">
        <div className="w-8 h-8 border-2 border-[#7F77DD] border-t-transparent rounded-full animate-spin" />
      </div>
    </AppLayout>
  )

  const issuesPieData = Object.entries(summary?.issues_by_severity || {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1), value
  }))

  const recData = Object.entries(summary?.by_recommendation || {}).map(([name, value]) => ({
    name: name.replace('_', ' '), value
  }))

  const dailyData = Object.entries(summary?.daily_reviews || {}).map(([day, count]) => ({
    day, reviews: count
  }))

  return (
    <AppLayout>
      <Topbar title="Analytics" subtitle="Code quality insights" />
      <main className="p-6 space-y-6">

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            icon={<Zap size={16} />}
            label="Total AI Reviews"
            value={summary?.total_reviews || 0}
            delay={0.1}
          />
          <StatCard
            icon={<Star size={16} />}
            label="Avg Review Score"
            value={summary?.avg_score ? `${summary.avg_score}/10` : 'N/A'}
            delay={0.2}
          />
          <StatCard
            icon={<GitBranch size={16} />}
            label="Connected Repos"
            value={`${summary?.connected_repos || 0}/${summary?.total_repos || 0}`}
            sub="repositories"
            delay={0.3}
          />
          <StatCard
            icon={<AlertTriangle size={16} />}
            label="Issues Found"
            value={Object.values(summary?.issues_by_severity || {}).reduce((a, b) => a + b, 0)}
            sub="across all PRs"
            delay={0.4}
          />
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-2 gap-4">

          {/* Score trend */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#0f0f18] border border-[#7F77DD]/10 rounded-xl p-5"
          >
            <h3 className="text-sm font-medium text-[#c8c8dd] mb-4">Score trend</h3>
            {trend.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(127,119,221,0.08)" />
                  <XAxis dataKey="pr" tick={{ fill: '#8a8a9a', fontSize: 11 }} />
                  <YAxis domain={[0, 10]} tick={{ fill: '#8a8a9a', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="score" stroke="#7F77DD" strokeWidth={2} dot={{ fill: '#7F77DD', r: 4 }} name="Overall" />
                  <Line type="monotone" dataKey="security" stroke="#5DCAA5" strokeWidth={1.5} dot={false} name="Security" />
                  <Line type="monotone" dataKey="performance" stroke="#FAC775" strokeWidth={1.5} dot={false} name="Performance" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-[#8a8a9a] text-sm">
                No review data yet
              </div>
            )}
          </motion.div>

          {/* Issues by severity pie */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#0f0f18] border border-[#7F77DD]/10 rounded-xl p-5"
          >
            <h3 className="text-sm font-medium text-[#c8c8dd] mb-4">Issues by severity</h3>
            {issuesPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={issuesPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {issuesPieData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={COLORS[entry.name.toLowerCase()] || '#7F77DD'}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    formatter={(value) => (
                      <span style={{ color: '#8a8a9a', fontSize: 12 }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-[#8a8a9a] text-sm">
                No issues data yet
              </div>
            )}
          </motion.div>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-2 gap-4">

          {/* Daily reviews bar chart */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-[#0f0f18] border border-[#7F77DD]/10 rounded-xl p-5"
          >
            <h3 className="text-sm font-medium text-[#c8c8dd] mb-4">Reviews per day</h3>
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(127,119,221,0.08)" />
                  <XAxis dataKey="day" tick={{ fill: '#8a8a9a', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#8a8a9a', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="reviews" fill="#7F77DD" radius={[4, 4, 0, 0]} name="Reviews" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-40 flex items-center justify-center text-[#8a8a9a] text-sm">
                No data for last 7 days
              </div>
            )}
          </motion.div>

          {/* Recommendation breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-[#0f0f18] border border-[#7F77DD]/10 rounded-xl p-5"
          >
            <h3 className="text-sm font-medium text-[#c8c8dd] mb-4">AI recommendations</h3>
            {recData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={recData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(127,119,221,0.08)" />
                  <XAxis type="number" tick={{ fill: '#8a8a9a', fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: '#8a8a9a', fontSize: 11 }} width={110} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Count">
                    {recData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={
                          entry.name === 'approve' ? '#5DCAA5' :
                          entry.name === 'request changes' ? '#F09595' : '#afa9ec'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-40 flex items-center justify-center text-[#8a8a9a] text-sm">
                No recommendation data yet
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </AppLayout>
  )
}