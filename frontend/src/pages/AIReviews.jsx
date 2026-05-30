import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap, Shield, AlertTriangle, CheckCircle,
  XCircle, MessageSquare, ChevronDown, ChevronUp,
  ExternalLink, RefreshCw
} from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'
import Topbar from '../components/layout/Topbar'
import { getReviews } from '../api/reviews'

const scoreColor = (score) => {
  if (score >= 8) return '#5DCAA5'
  if (score >= 5) return '#FAC775'
  return '#F09595'
}

const severityConfig = {
  critical: { color: '#F09595', bg: 'rgba(240,149,149,0.08)', label: 'Critical' },
  high:     { color: '#FAC775', bg: 'rgba(250,199,117,0.08)', label: 'High' },
  medium:   { color: '#afa9ec', bg: 'rgba(175,169,236,0.08)', label: 'Medium' },
  low:      { color: '#5DCAA5', bg: 'rgba(93,202,165,0.08)',  label: 'Low' },
}

const recConfig = {
  approve:         { icon: <CheckCircle size={14} />, color: '#5DCAA5', label: 'Approve' },
  request_changes: { icon: <XCircle size={14} />,    color: '#F09595', label: 'Request Changes' },
  comment:         { icon: <MessageSquare size={14} />, color: '#afa9ec', label: 'Comment' },
}

function ReviewCard({ review }) {
  const [expanded, setExpanded] = useState(false)
  const rec = recConfig[review.recommendation] || recConfig.comment
  const color = scoreColor(review.score)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0f0f18] border border-[#7F77DD]/10 rounded-xl overflow-hidden hover:border-[#7F77DD]/20 transition-colors"
    >
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-[#8a8a9a] font-mono">#{review.pr_number}</span>
              <span className="text-xs text-[#ffffff20]">·</span>
              <span className="text-xs text-[#8a8a9a]">{review.repo_full_name}</span>
            </div>
            <h3 className="text-sm font-medium text-[#c8c8dd] truncate">{review.pr_title}</h3>
          </div>

          {/* Score ring */}
          <div className="flex-shrink-0 text-center">
            <div
              className="text-2xl font-bold"
              style={{ color }}
            >
              {review.score}
            </div>
            <div className="text-[10px] text-[#8a8a9a]">/ 10</div>
          </div>
        </div>

        {/* Summary */}
        <p className="text-xs text-[#8a8a9a] leading-relaxed mb-4">{review.summary}</p>

        {/* Score bars */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: 'Security', score: review.security_score },
            { label: 'Performance', score: review.performance_score },
            { label: 'Maintainability', score: review.maintainability_score },
          ].map(({ label, score }) => (
            <div key={label}>
              <div className="flex justify-between text-[10px] text-[#8a8a9a] mb-1">
                <span>{label}</span>
                <span>{score}/10</span>
              </div>
              <div className="h-1 bg-[#7F77DD]/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${score * 10}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="h-full rounded-full"
                  style={{ background: scoreColor(score) }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
              style={{ color: rec.color, background: `${rec.color}15` }}
            >
              {rec.icon} {rec.label}
            </span>
            <span className="text-xs text-[#8a8a9a]">
              {review.issues?.length || 0} issues · {review.positives?.length || 0} positives
            </span>
          </div>
          <div className="flex items-center gap-2">
            {review.pr_url && (
              <a
                href={review.pr_url}
                target="_blank"
                rel="noreferrer"
                className="text-[#8a8a9a] hover:text-[#afa9ec] transition-colors"
              >
                <ExternalLink size={13} />
              </a>
            )}
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-[#8a8a9a] hover:text-[#afa9ec] transition-colors"
            >
              {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded issues */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-[#7F77DD]/08"
          >
            <div className="p-5 space-y-3">
              {review.issues?.length > 0 ? (
                <>
                  <p className="text-xs font-medium text-[#c8c8dd] mb-3">Issues</p>
                  {review.issues.map((issue, i) => {
                    const sev = severityConfig[issue.severity] || severityConfig.low
                    return (
                      <div
                        key={i}
                        className="rounded-lg p-3 border"
                        style={{
                          background: sev.bg,
                          borderColor: `${sev.color}20`
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                            style={{ color: sev.color, background: `${sev.color}15` }}
                          >
                            {sev.label}
                          </span>
                          <span className="text-xs font-medium text-[#c8c8dd]">{issue.title}</span>
                        </div>
                        <p className="text-xs text-[#8a8a9a] mb-1.5">{issue.description}</p>
                        <p className="text-xs text-[#afa9ec]">
                          💡 {issue.suggestion}
                        </p>
                      </div>
                    )
                  })}
                </>
              ) : (
                <p className="text-xs text-[#5DCAA5]">✅ No issues found!</p>
              )}

              {review.positives?.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-medium text-[#c8c8dd] mb-2">What's good</p>
                  {review.positives.map((p, i) => (
                    <p key={i} className="text-xs text-[#8a8a9a] py-1 flex gap-2">
                      <span className="text-[#5DCAA5]">✓</span> {p}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function AIReviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    try {
      const res = await getReviews()
      setReviews(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <Topbar title="AI Reviews" subtitle="GPT-4o powered code analysis" />
      <main className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-[#7F77DD]" />
            <span className="text-sm text-[#8a8a9a]">{reviews.length} reviews completed</span>
          </div>
          <button
            onClick={loadReviews}
            className="flex items-center gap-2 text-sm text-[#8a8a9a] hover:text-[#afa9ec] transition-colors"
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#7F77DD] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && reviews.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Zap size={40} className="text-[#7F77DD]/30 mx-auto mb-4" />
            <p className="text-[#c8c8dd] font-medium mb-2">No reviews yet</p>
            <p className="text-[#8a8a9a] text-sm max-w-sm mx-auto">
              Connect a repository and open a pull request to trigger your first AI review.
              Or use the manual review option from the Repositories page.
            </p>
          </motion.div>
        )}

        <div className="space-y-4">
          {reviews.map((review, i) => (
            <ReviewCard key={review.id || i} review={review} />
          ))}
        </div>
      </main>
    </AppLayout>
  )
}