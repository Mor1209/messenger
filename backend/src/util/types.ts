import { Prisma, PrismaClient } from '@prisma/client'
import { ISODateString } from 'next-auth'
import {
  conversationPopulated,
  participantPopulated,
} from '../graphql/resolvers/conversation'

export type GraphQLContext = {
  session: Session | null
  prisma: PrismaClient
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
