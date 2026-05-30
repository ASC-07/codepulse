import { motion } from 'framer-motion'
import { Zap, Shield, BarChart3, GitPullRequest, Code2 } from 'lucide-react'
const features = [
  { icon: <GitPullRequest size={18} />, text: "AI reviews every PR automatically" },
  { icon: <Shield size={18} />, text: "OWASP security vulnerability detection" },
  { icon: <BarChart3 size={18} />, text: "Team velocity & analytics dashboard" },
  { icon: <Zap size={18} />, text: "Real-time notifications via WebSocket" },
]

export default function Login() {
  const handleGitHubLogin = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  window.location.href = `${apiUrl}/api/auth/github`
}

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">

      {/* Left Panel */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex w-1/2 flex-col justify-between p-12 border-r border-[#7F77DD]/10"
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#7F77DD] rounded-lg flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <div className="text-white font-semibold text-lg leading-none">CodePulse</div>
            <div className="text-[#7F77DD] text-xs">AI Code Review</div>
          </div>
        </div>

        {/* Center content */}
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-5xl font-bold text-white leading-tight mb-4"
          >
            Code review,
            <br />
            <span className="text-[#7F77DD]">supercharged</span>
            <br />
            with AI.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-[#8a8a9a] text-lg mb-10"
          >
            Automatically review every pull request with GPT-4o. Catch bugs, security issues and bad patterns before they hit production.
          </motion.p>

          <div className="flex flex-col gap-4">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="flex items-center gap-3 text-[#c8c8dd]"
              >
                <div className="w-8 h-8 rounded-lg bg-[#7F77DD]/10 flex items-center justify-center text-[#7F77DD]">
                  {f.icon}
                </div>
                <span className="text-sm">{f.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="flex gap-8">
          {[["500+", "PRs reviewed"], ["94%", "AI accuracy"], ["4x", "faster reviews"]].map(([val, label]) => (
            <div key={label}>
              <div className="text-2xl font-bold text-[#7F77DD]">{val}</div>
              <div className="text-xs text-[#8a8a9a]">{label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Right Panel */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex-1 flex flex-col items-center justify-center p-8"
      >
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-10 justify-center">
            <div className="w-9 h-9 bg-[#7F77DD] rounded-lg flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <div className="text-white font-semibold text-lg">CodePulse</div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
            <p className="text-[#8a8a9a] mb-8">Sign in with your GitHub account to continue</p>

            {/* GitHub Login Button */}
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "#21262d" }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGitHubLogin}
              className="w-full flex items-center justify-center gap-3 bg-[#161b22] border border-[#30363d] text-white rounded-xl py-4 px-6 font-medium text-base transition-colors duration-200 cursor-pointer"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
</svg>
              Continue with Github
            </motion.button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-[#7F77DD]/10"></div>
              <span className="text-[#8a8a9a] text-xs">secure OAuth 2.0</span>
              <div className="flex-1 h-px bg-[#7F77DD]/10"></div>
            </div>

            {/* Info box */}
            <div className="bg-[#0f0f18] border border-[#7F77DD]/10 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Shield size={16} className="text-[#7F77DD] mt-0.5 flex-shrink-0" />
                <p className="text-[#8a8a9a] text-xs leading-relaxed">
                  We only request access to your public repositories and pull request data. We never store your code.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

    </div>
  )
}