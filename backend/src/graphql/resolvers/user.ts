import { CreateUsernameResponse, GraphQLContext } from '../../util/types'
import { GraphQLError } from 'graphql'
import { User } from '@prisma/client'

const resolvers = {
  Query: {
    searchUsers: async (
      _: any,
      args: { username: string },
      context: GraphQLContext
    ): Promise<Array<User>> => {
      const { username: searchedUsername } = args
      const { session, prisma } = context

      if (!session?.user) {
        throw new GraphQLError('Not authorized')
      }

      const {
        user: { username: currentUsername },
      } = session

      try {
        const users = await prisma.user.findMany({
          where: {
            username: {
              contains: searchedUsername,
              not: currentUsername,
              mode: 'insensitive',
            },
          },
        })

        return users
      } catch (error: any) {
        console.log('searchUsers error', error)
        throw new GraphQLError(error?.message)
      }
    },
  },
  Mutation: {
    createUsername: async (
      _: any,
      args: { username: string },
      context: GraphQLContext
    ): Promise<CreateUsernameResponse> => {
      const { username } = args
      const { prisma, session } = context

      if (!session?.user) {
        return {
          error: 'Not authorized',
        }
      }

      const { id: userId } = session.user

      try {
        const existingUser = await prisma.user.findUnique({
          where: {
            username,
          },
        })

        if (existingUser) {
          return {
            error: 'Username already taken. Try another',
          }
        }

        await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            username,
          },
        })

        return { success: true }
      } catch (error: any) {
        console.log('createUsername error', error)
        return {
          error: error?.message,
        }
      }
    },
  },
}

export default resolvers
