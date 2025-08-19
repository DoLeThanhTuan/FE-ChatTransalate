const Status = Object.freeze({
    MESSAGE: 'MESSAGE',
    CREATE_CHANNEL: 'CREATE_CHANNEL',
    LEAVE_CHANNEL: 'LEAVE_CHANNEL',
    JOIN_CHANNEL: 'JOIN_CHANNEL',
    ADD_MEMBER: 'ADD_MEMBER',
    CHANGE_NAME: 'CHANGE_NAME',
    REMOVE_MEMBER: 'REMOVE_MEMBER',
});

const URLMessage = Object.freeze({
    WS: '/ws',
    RECEIVE_CHANNEL_MESSAGE: '/topic/messages',
    CHANNEL: '/app/chat/send/',
    LEAVE_CHANNEL: 'LEAVE_CHANNEL',
    JOIN_CHANNEL: 'JOIN_CHANNEL',
    ADD_MEMBER: 'ADD_MEMBER',
    CHANGE_NAME: 'CHANGE_NAME',
    REMOVE_MEMBER: 'REMOVE_MEMBER',
});

export {
    Status,
    URLMessage
}