import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'

let stompClient = null
let currentSubscription = null
let urlSocket = 'http://localhost:8000/ws'

export const connectSocket = (token, onConnectSuccess, onDisconnect, onError) => {
  return new Promise((resolve, reject) => {
    const socket = new SockJS(`${urlSocket}?token=${token}`)
    stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      onConnect: () => {
        console.log('WebSocket connected')
        onConnectSuccess?.()
        resolve()
      },
      onStompError: (error) => {
        console.error('STOMP error: ', error)
        onError?.(error)
        reject(error)
      },
      onWebSocketClose: () => {
        console.log('WebSocket connection closed')
        onDisconnect?.()
      },
      onWebSocketError: (error) => {
        console.error('WebSocket error: ', error)
        onError?.(error)
      },
      reconnectDelay: 5000,
    })
    stompClient.activate()
  })
}

export const subscribeSocket = (urlSubcribe, onMessageCallback) => {
  if (!stompClient || !stompClient.connected) {
    console.warn('Cannot subscribe because socket is not connected')
    return
  }

  // Hủy subscription cũ nếu có
  if (currentSubscription) {
    currentSubscription.unsubscribe()
  }

  // Tạo subscription mới
  currentSubscription = stompClient.subscribe(urlSubcribe, (message) => {
    const parsed = JSON.parse(message.body)
    onMessageCallback(parsed)
  })

  console.log(`Subscribed to ${urlSubcribe}`)
}

export const disconnectSocket = () => {
  if (currentSubscription) {
    currentSubscription.unsubscribe()
    currentSubscription = null
  }

  if (stompClient) {
    stompClient.deactivate()
    stompClient = null
  }
}

export const send = (destination, message) => {
  if (stompClient && stompClient.connected) {
    stompClient.publish({
      destination: destination,
      body: JSON.stringify(message),
    })
  }
}
