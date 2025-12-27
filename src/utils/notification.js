import { TypeChat } from '@/config/enum'

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('Trình duyệt không hỗ trợ Notification')
    return
  }

  if (Notification.permission === 'granted') {
    return
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    console.log('Notification permission:', permission)
  }
}
export const showChatNotification = (message, callback) => {
  if (Notification.permission !== 'granted') return
  const title = message.channelId
    ? `${message.channelName} - ${message.fromName}`
    : `${message.fromName}`
  const notification = new Notification('💬 Tin nhắn mới', {
    body: `${title}\n${message.content}`,
    icon: '/src/assets/logo.png',
    data: {
      typeChat: message.channelId ? TypeChat.CHANNEL : TypeChat.USER,
      chatKey: message.channelId ? message.channelId : message.fromUser,
      messageId: message.id,
    },
  })

  notification.onclick = () => {
    window.focus()
    const { typeChat, chatKey, messageId } = notification.data
    callback(typeChat, chatKey)
  }
}
