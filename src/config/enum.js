const Status = Object.freeze({
  MESSAGE: 'MESSAGE',
  CREATE_CHANNEL: 'CREATE_CHANNEL',
  LEAVE_CHANNEL: 'LEAVE_CHANNEL',
  BREAK_CHANNEL: 'BREAK_CHANNEL',
  JOIN_CHANNEL: 'JOIN_CHANNEL',
  ADD_MEMBER: 'ADD_MEMBER',
  CHANGE_NAME: 'CHANGE_NAME',
  REMOVE_MEMBER: 'REMOVE_MEMBER',
  DELETE_MESSAGE: 'DELETE_MESSAGE',
  REACTION_MESSAGE: 'REACTION_MESSAGE',
})

const ChannelType = Object.freeze({
  GENERAL: 'GENERAL',
  CUSTOM: 'CUSTOM',
  DEPARTMENT: 'DEPARTMENT',
  ORGANIZATION: 'ORGANIZATION',
})

const URLMessage = Object.freeze({
  WS: '/ws',
  RECEIVE_CHANNEL_MESSAGE: '/topic/messages',
  CHANNEL: '/app/chat/send',
  RECEIVE_USER_MESSAGE: '/user/queue/private',
  USER: '/app/chat/private',
  GENERAL: '/topic/messages/general',
})

const Language = Object.freeze([
  {
    value: 'VI',
    name: 'VI',
  },
  {
    value: 'EN',
    name: 'EN',
  },
  {
    value: 'JP',
    name: 'JP',
  },
])

const TypeChat = Object.freeze({
  CHANNEL: 'channel',
  USER: 'user',
})

export { Status, URLMessage, TypeChat, Language, ChannelType }
