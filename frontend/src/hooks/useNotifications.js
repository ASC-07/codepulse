import { useState, useCallback } from 'react'

export function useNotifications() {
  const [notifications, setNotifications] = useState([])

  const addNotification = useCallback((notif) => {
    const id = Date.now()
    setNotifications(prev => [{ ...notif, id }, ...prev].slice(0, 20))

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }, [])

  const dismiss = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  return { notifications, addNotification, dismiss }
}