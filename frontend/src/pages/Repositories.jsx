import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { GitBranch, Star, GitFork, RefreshCw, Zap, Lock, Globe } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'
import Topbar from '../components/layout/Topbar'
import { getRepos, syncRepos, connectRepo } from '../api/repos'

export default function Repositories() {
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [connecting, setConnecting] = useState(null)

  useEffect(() => {
    loadRepos()
  }, [])

  const loadRepos = async () => {
    try {
      const res = await getRepos()
      setRepos(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      await syncRepos()
      await loadRepos()
    } catch (e) {
      console.error(e)
    } finally {
      setSyncing(false)
    }
  }

  const handleConnect = async (fullName) => {
    setConnecting(fullName)
    try {
      await connectRepo(fullName)
      await loadRepos()
    } catch (e) {
      console.error(e)
    } finally {
      setConnecting(null)
    }
  }

  const langColors = {
    JavaScript: '#F7DF1E',
    TypeScript: '#3178C6',
    Python: '#3776AB',
    Java: '#ED8B00',
    Go: '#00ADD8',
    Rust: '#CE422B',
    CSS: '#563D7C',
    HTML: '#E34C26',
    default: '#8a8a9a'
  }

  return (
    <AppLayout>
      <Topbar title="Repositories" subtitle="Manage your connected repositories" />
      <main className="p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-[#8a8a9a]">{repos.length} repositories found</p>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 bg-[#7F77DD] hover:bg-[#6a63cc] disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing...' : 'Sync from GitHub'}
          </button>
        </div>

        {!loading && repos.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <GitBranch size={40} className="text-[#7F77DD]/30 mx-auto mb-4" />
            <p className="text-[#c8c8dd] font-medium mb-2">No repositories yet</p>
            <p className="text-[#8a8a9a] text-sm mb-6">
              Click "Sync from GitHub" to import your repositories
            </p>
            <button
              onClick={handleSync}
              className="bg-[#7F77DD] text-white px-6 py-2.5 rounded-lg text-sm hover:bg-[#6a63cc] transition-colors"
            >
              Sync repositories
            </button>
          </motion.div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {repos.map((repo, i) => (
            <motion.div
              key={repo.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[#0f0f18] border border-[#7F77DD]/10 rounded-xl p-5 hover:border-[#7F77DD]/25 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {repo.private
                    ? <Lock size={14} className="text-[#FAC775]" />
                    : <Globe size={14} className="text-[#5DCAA5]" />
                  }
                    <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-[#afa9ec] hover:text-[#7F77DD] transition-colors"
                  >
                    {repo.name}
                  </a>
                </div>
                {repo.connected ? (
                  <span className="flex items-center gap-1 text-[10px] bg-[#5DCAA5]/10 text-[#5DCAA5] px-2 py-1 rounded-full">
                    <Zap size={9} /> AI Active
                  </span>
                ) : (
                  <button
                    onClick={() => handleConnect(repo.full_name)}
                    disabled={connecting === repo.full_name}
                    className="text-[10px] bg-[#7F77DD]/10 hover:bg-[#7F77DD]/20 text-[#afa9ec] px-2.5 py-1 rounded-full transition-colors disabled:opacity-50"
                  >
                    {connecting === repo.full_name ? 'Connecting...' : 'Connect'}
                  </button>
                )}
              </div>

              {repo.description && (
                <p className="text-xs text-[#8a8a9a] mb-3 line-clamp-2">
                  {repo.description}
                </p>
              )}

              <div className="flex items-center gap-4 text-xs text-[#8a8a9a]">
                {repo.language && (
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: langColors[repo.language] || langColors.default }}
                    />
                    {repo.language}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Star size={11} /> {repo.stars}
                </span>
                <span className="flex items-center gap-1">
                  <GitFork size={11} /> {repo.forks}
                </span>
                {repo.open_issues > 0 && (
                  <span className="text-[#FAC775]">{repo.open_issues} open issues</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </AppLayout>
  )
}