import { Prisma, PrismaClient } from '@prisma/client'
import { PubSub } from 'graphql-subscriptions'
import { ISODateString } from 'next-auth'
import {
  conversationPopulated,
  participantPopulated,
} from '../graphql/resolvers/conversation'
import { Context } from 'graphql-ws/lib/server'

export type GraphQLContext = {
  session: Session | null
  prisma: PrismaClient
  pubsub: PubSub
}

export interface SubscriptionContext extends Context {
  connectionParams: {
    session?: Session
  }
}

export type Session = {
  user?: User
}

export type User = {
  id: string
  username: string
  image: string
  email: string
  name: string
}

export type CreateUsernameResponse = {
  success?: boolean
  error?: string
}

export type ConversationPopulated = Prisma.ConversationGetPayload<{
  include: typeof conversationPopulated
}>

export type ParticipantPopulated = Prisma.ConversationParticipantGetPayload<{
  include: typeof participantPopulated
}>

export type ConversationCreatedSubscriptionPayload = {
  conversationCreated: ConversationPopulated
}
