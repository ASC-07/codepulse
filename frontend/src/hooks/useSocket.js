import { useEffect, useRef, useCallback } from 'react'

export function useSocket(userId, onMessage) {
  const ws = useRef(null)
  const reconnectTimer = useRef(null)

  const connect = useCallback(() => {
    if (!userId) return
    const token = localStorage.getItem('access_token')
    if (!token) return

    const url = `ws://localhost:8000/ws/${userId}?token=${token}`
    ws.current = new WebSocket(url)

    ws.current.onopen = () => {
      console.log('WebSocket connected')
      // Send ping every 30s to keep alive
      const pingInterval = setInterval(() => {
        if (ws.current?.readyState === WebSocket.OPEN) {
          ws.current.send('ping')
        }
      }, 30000)
      ws.current._pingInterval = pingInterval
    }

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        onMessage?.(data)
      } catch (e) {}
    }

    ws.current.onclose = () => {
      console.log('WebSocket disconnected — reconnecting in 3s')
      clearInterval(ws.current?._pingInterval)
      // Auto-reconnect
      reconnectTimer.current = setTimeout(connect, 3000)
    }

    ws.current.onerror = () => {
      ws.current?.close()
    }
  }, [userId, onMessage])

  useEffect(() => {
    connect()
    return () => {
      clearTimeout(reconnectTimer.current)
      clearInterval(ws.current?._pingInterval)
      ws.current?.close()
    }
  }, [connect])

  return ws
}