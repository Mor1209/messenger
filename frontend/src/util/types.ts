import {
  ConversationPopulated,
  MessagePopulated,
} from '../../../backend/src/util/types'

// Users
export type CreateUsernameData = {
  createUsername: {
    success: boolean
    error: string
  }
}

export type CreateUsernameVariables = {
  username: string
}

export type SearchUsersInput = {
  username: string
}

export type SearchUsersData = {
  searchUsers: Array<SearchedUser>
}

export type SearchedUser = {
  id: string
  username: string
}

// Conversations
export type ConversationsData = {
  conversations: Array<ConversationPopulated>
}

export type createConversationData = {
  createConversation: {
    conversationId: string
  }
}

export type createConversationInput = {
  participantIds: Array<string>
}

// Messages
export type MessagesData = {
  messages: Array<MessagePopulated>
}

export type MessageVariables = {
  conversationId: string
}

export type MessageSubscriptionData = {
  subscriptionData: {
    data: {
      messageSent: MessagePopulated
    }
  }
}
