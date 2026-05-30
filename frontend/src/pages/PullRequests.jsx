import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { GitPullRequest, ExternalLink, Zap, RefreshCw } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'
import Topbar from '../components/layout/Topbar'
import { getRepos } from '../api/repos'
import { getRepoPRs } from '../api/repos'

const stateConfig = {
  open:   { label: 'Open',   color: '#5DCAA5', bg: 'rgba(93,202,165,0.1)' },
  closed: { label: 'Closed', color: '#8a8a9a', bg: 'rgba(138,138,154,0.1)' },
}

export default function PullRequests() {
  const [prs, setPrs] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadPRs = async () => {
    try {
      const reposRes = await getRepos()
      const connectedRepos = reposRes.data.filter(r => r.connected)

      const allPRs = []
      for (const repo of connectedRepos) {
        try {
          const prRes = await getRepoPRs(repo.full_name)
          prRes.data.forEach(pr => {
            allPRs.push({
              ...pr,
              repo_name: repo.full_name
            })
          })
        } catch (e) {}
      }

      allPRs.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      setPrs(allPRs)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { loadPRs() }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    loadPRs()
  }

  return (
    <AppLayout>
      <Topbar title="Pull Requests" subtitle="From your connected repositories" />
      <main className="p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-[#8a8a9a]">{prs.length} pull requests found</p>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 text-sm text-[#8a8a9a] hover:text-[#afa9ec] transition-colors"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#7F77DD] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && prs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <GitPullRequest size={40} className="text-[#7F77DD]/30 mx-auto mb-4" />
            <p className="text-[#c8c8dd] font-medium mb-2">No pull requests found</p>
            <p className="text-[#8a8a9a] text-sm">
              Connect a repository first, then open PRs on it to see them here.
            </p>
          </motion.div>
        )}

        <div className="space-y-3">
          {prs.map((pr, i) => {
            const state = stateConfig[pr.state] || stateConfig.closed
            return (
              <motion.div
                key={pr.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#0f0f18] border border-[#7F77DD]/10 rounded-xl p-4 hover:border-[#7F77DD]/20 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-0.5">
                    <GitPullRequest size={16} style={{ color: state.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-[#c8c8dd]">{pr.title}</p>
                        <p className="text-xs text-[#8a8a9a] mt-1">
                          {pr.repo_name} · #{pr.number} · by {pr.user?.login} · {new Date(pr.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className="text-xs px-2.5 py-1 rounded-full font-medium"
                          style={{ color: state.color, background: state.bg }}
                        >
                          {state.label}
                        </span>
                        <a
                          href={pr.html_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#8a8a9a] hover:text-[#afa9ec] transition-colors"
                        >
                          <ExternalLink size={13} />
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-[#5DCAA5]">+{pr.additions || 0}</span>
                      <span className="text-xs text-[#F09595]">-{pr.deletions || 0}</span>
                      <span className="text-xs text-[#8a8a9a]">{pr.changed_files || 0} files</span>
                      <span className="flex items-center gap-1 text-[10px] text-[#7F77DD] bg-[#7F77DD]/08 px-2 py-0.5 rounded-full">
                        <Zap size={9} /> AI Ready
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </main>
    </AppLayout>
  )
}