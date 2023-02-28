import gql from 'graphql-tag'

const typeDefs = gql`
  type Mutation {
    createConversation(participantIds: [String]): createConversationResponse
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

  type Subscription {
    conversationCreated: Conversation
  }
`

export default typeDefs
