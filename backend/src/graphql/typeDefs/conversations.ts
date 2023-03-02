import gql from 'graphql-tag'

const typeDefs = gql`
  type Mutation {
    createConversation(participantIds: [String]): createConversationResponse
  }

  type Mutation {
    markConversationAsRead(userId: String!, conversationId: String!): Boolean
  }

  type Mutation {
    deleteConversation(conversationId: String!): Boolean
  }

  type Mutation {
    updateParticipants(
      conversationId: String!
      participantIds: [String]!
    ): Boolean
  }

  type createConversationResponse {
    conversationId: String
  }

  type Conversation {
    id: String
    latestMessage: Message
    participants: [Participant]
    createdAt: Date
    updatedAt: Date
  }

  type Participant {
    id: String
    user: User
    hasSeenLatestMessage: Boolean
  }

  type Query {
    conversations: [Conversation]
  }

  type ConversationDeletedResponse {
    id: String
  }

  type ConversationUpdatedSubscriptionPayload {
    conversation: Conversation
    addedUserIds: [String]
    removedUserIds: [String]
  }

  type Subscription {
    conversationCreated: Conversation
  }

  type Subscription {
    conversationUpdated: ConversationUpdatedSubscriptionPayload
  }

  type Subscription {
    conversationDeleted: ConversationDeletedResponse
  }
`

export default typeDefs
