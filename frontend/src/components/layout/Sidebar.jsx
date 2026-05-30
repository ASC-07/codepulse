import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, GitPullRequest, Zap, BarChart3,
  Users, GitBranch, Bell, Settings, LogOut, Code2
} from 'lucide-react'

const navItems = [
  { icon: <LayoutDashboard size={17} />, label: 'Dashboard', to: '/dashboard' },
  { icon: <GitPullRequest size={17} />, label: 'Pull Requests', to: '/pull-requests', badge: 8 },
  { icon: <Zap size={17} />, label: 'AI Reviews', to: '/reviews', badge: 3 },
  { icon: <BarChart3 size={17} />, label: 'Analytics', to: '/analytics' },
]

const secondaryItems = [
  { icon: <Users size={17} />, label: 'Team', to: '/team' },
  { icon: <GitBranch size={17} />, label: 'Repositories', to: '/repositories' },
  { icon: <Bell size={17} />, label: 'Notifications', to: '/notifications' },
  { icon: <Settings size={17} />, label: 'Settings', to: '/settings' },
]

export default function Sidebar({ user }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    navigate('/login')
  }

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-[220px] flex-shrink-0 bg-[#0f0f18] border-r border-[#7F77DD]/10 flex flex-col h-screen sticky top-0"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[#7F77DD]/10">
        <div className="w-8 h-8 bg-[#7F77DD] rounded-lg flex items-center justify-center flex-shrink-0">
          <Code2 size={16} className="text-white" />
        </div>
        <div>
          <div className="text-white font-semibold text-sm leading-none">CodePulse</div>
          <div className="text-[#7F77DD] text-[11px] mt-0.5">AI Code Review</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-[#7F77DD]/15 text-[#afa9ec]'
                    : 'text-[#8a8a9a] hover:bg-[#7F77DD]/08 hover:text-[#c8c8dd]'
                }`
              }
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="bg-[#7F77DD]/25 text-[#afa9ec] text-[10px] px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        <div className="mt-6">
          <p className="text-[10px] text-[#ffffff20] uppercase tracking-widest px-3 mb-2">Team</p>
          <div className="space-y-1">
            {secondaryItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-[#7F77DD]/15 text-[#afa9ec]'
                      : 'text-[#8a8a9a] hover:bg-[#7F77DD]/08 hover:text-[#c8c8dd]'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-[#7F77DD]/10">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
          {user?.avatar_url && (
            <img
              src={user.avatar_url}
              className="w-7 h-7 rounded-full border border-[#7F77DD]/30"
              alt={user.username}
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm text-[#c8c8dd] truncate">{user?.name || user?.username}</div>
            <div className="text-[11px] text-[#8a8a9a] truncate">@{user?.username}</div>
          </div>
          <button
            onClick={handleLogout}
            className="text-[#8a8a9a] hover:text-[#F09595] transition-colors p-1 rounded"
            title="Logout"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </motion.aside>
  )
}