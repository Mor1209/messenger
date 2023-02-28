import {
  ConversationCreatedSubscriptionPayload,
  ConversationPopulated,
  GraphQLContext,
} from '../../util/types'
import { GraphQLError } from 'graphql'
import { Prisma } from '@prisma/client'
import { withFilter } from 'graphql-subscriptions'
import { userIsConversationParticipant } from '../../util/functions'

const resolvers = {
  Query: {
    conversations: async (
      _: any,
      __: any,
      context: GraphQLContext
    ): Promise<Array<ConversationPopulated>> => {
      const { session, prisma } = context

      if (!session?.user) {
        throw new GraphQLError('Not authorized')
      }

      const {
        user: { id },
      } = session

      try {
        const conversations = await prisma.conversation.findMany({
          where: {
            participants: {
              some: {
                userId: {
                  equals: id,
                },
              },
            },
          },
          include: conversationPopulated,
        })

        return conversations
      } catch (error: any) {
        console.log('conversations error', error)
        throw new GraphQLError(error?.message)
      }
    },
  },
  Mutation: {
    createConversation: async (
      _: any,
      args: { participantIds: Array<string> },
      context: GraphQLContext
    ): Promise<{ conversationId: string }> => {
      const { session, prisma, pubsub } = context
      const { participantIds } = args

      if (!session?.user) {
        throw new GraphQLError('Not authorized')
      }

      const {
        user: { id: userId },
      } = session

      try {
        const conversation = await prisma.conversation.create({
          data: {
            participants: {
              createMany: {
                data: participantIds.map(id => ({
                  userId: id,
                  hasSeenLatestMessage: id === userId,
                })),
              },
            },
          },
          include: conversationPopulated,
        })

        pubsub.publish('CONVERSATION_CREATED', {
          conversationCreated: conversation,
        })

        return {
          conversationId: conversation.id,
        }
      } catch (error: any) {
        console.log('createConversation error', error)
        throw new GraphQLError('Error creating conversation')
      }
    },
  },
  Subscription: {
    conversationCreated: {
      subscribe: withFilter(
        (_: any, __: any, context: GraphQLContext) => {
          const { pubsub } = context

          return pubsub.asyncIterator(['CONVERSATION_CREATED'])
        },
        (
          payload: ConversationCreatedSubscriptionPayload,
          _,
          context: GraphQLContext
        ) => {
          const { session } = context

          if (!session?.user) {
            throw new GraphQLError('Not authorized')
          }

          const { id: userId } = session.user
          const {
            conversationCreated: { participants },
          } = payload

          return userIsConversationParticipant(participants, userId)
        }
      ),
    },
  },
}

export const participantPopulated =
  Prisma.validator<Prisma.ConversationParticipantInclude>()({
    user: {
      select: {
        id: true,
        username: true,
      },
    },
  })

export const conversationPopulated =
  Prisma.validator<Prisma.ConversationInclude>()({
    participants: {
      include: participantPopulated,
    },
    latestMessage: {
      include: {
        sender: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    },
  })

export default resolvers
