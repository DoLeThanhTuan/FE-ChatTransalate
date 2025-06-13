import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'

let stompClient = null
let urlSocket = 'http://localhost:8000/ws'

export const connectSocket = (token, onMessageCallback, onConnectSuccess, onDisconnect, onError) => {
  return new Promise((resolve, reject) => {
    const socket = new SockJS(urlSocket + `?token=${token}`)
    stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      onConnect: () => {
        console.log('WebSocket connected');
        onConnectSuccess();
        stompClient.subscribe('/topic/messages/1', (message) => {
          const parsed = JSON.parse(message.body)
          onMessageCallback(parsed)
        })
        resolve()
      },
      onStompError: (error) => {
        console.log('STOMP error: ', error)
        if (onError) onError(error)
        reject(error)
      },
      onWebSocketClose: () => {
        console.log('WebSocket connection closed')
        if (onDisconnect) onDisconnect()
      },
      onWebSocketError: (error) => {
        console.log('WebSocket error: ', error)
        if (onError) onError(error)
      },
      reconnectDelay: 5000,
    })
    stompClient.activate()
  })
}

export const disconnectSocket = () => {
  if (stompClient) {
    stompClient.deactivate()
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
