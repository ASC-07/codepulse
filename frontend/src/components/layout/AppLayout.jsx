import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import { getMe } from '../../api/auth'
import { useSocket } from '../../hooks/useSocket'
import { useNotifications } from '../../hooks/useNotifications'
import NotificationToast from '../ui/NotificationToast'

export default function AppLayout({ children }) {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  const { notifications, addNotification, dismiss } = useNotifications()

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) { navigate('/login'); return }
    getMe()
      .then(res => setUser(res.data))
      .catch(() => navigate('/login'))
  }, [navigate])

  const handleSocketMessage = useCallback((msg) => {
    if (msg.event === 'review_complete') {
      addNotification({
        type: 'review_complete',
        title: 'AI Review Complete!',
        message: `PR #${msg.data.pr_number} in ${msg.data.repo}`,
        score: msg.data.score,
      })
    }
    if (msg.event === 'connected') {
      console.log('Real-time connected:', msg.data.message)
    }
  }, [addNotification])

  useSocket(user?.id, handleSocketMessage)

  if (!user) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[#7F77DD] border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="flex bg-[#0a0a0f] min-h-screen">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
      <NotificationToast notifications={notifications} dismiss={dismiss} />
    </div>
  )
}