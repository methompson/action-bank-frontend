enum MessageType {
  Info,
  Success,
  Error,
}

interface Message {
  id: string,
  message: string,
  messageType: MessageType,
  timerId: number,
  timeAdded: number,
}

interface MessagingState {
  messages: Record<string, Message>,
  loading: boolean,
}

interface MessagePayload {
  messageType: MessageType,
  message: string,
  duration: number,
}

export {
  MessageType,
};

export type {
  Message,
  MessagingState,
  MessagePayload,
};