// npm install @apollo/server express graphql cors body-parser
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default'
import express from 'express'
import http from 'http'
import cors from 'cors'
import { json } from 'body-parser'
import resolvers from './graphql/resolvers'
import typeDefs from './graphql/typeDefs'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { getSession } from 'next-auth/react'
import { GraphQLContext, Session, SubscriptionContext } from './util/types'
import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import { useServer } from 'graphql-ws/lib/use/ws'
import { PubSub } from 'graphql-subscriptions'
import { WebSocketServer } from 'ws'
import fetch from 'node-fetch'

async function main() {
  dotenv.config()
  // @ts-ignore
  globalThis.fetch = fetch

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  })

  const app = express()
  const httpServer = http.createServer(app)

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql/subscriptions',
  })

  const prisma = new PrismaClient()
  const pubsub = new PubSub()

  const getSubscriptionContext = async (
    ctx: SubscriptionContext
  ): Promise<GraphQLContext> => {
    ctx
    // when connectionParams live ctx is the graphql-ws Context
    if (ctx.connectionParams && ctx.connectionParams.session) {
      const { session } = ctx.connectionParams
      return { session, prisma, pubsub }
    }
    // Otherwise let our resolvers know we don't have a current user
    return { session: null, prisma, pubsub }
  }

  const serverCleanup = useServer(
    {
      schema,
      context: (ctx: SubscriptionContext) => {
        return getSubscriptionContext(ctx)
      },
    },
    wsServer
  )
  const server = new ApolloServer<GraphQLContext>({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose()
            },
          }
        },
      },
    ],
  })
  await server.start()

  // origin: process.env.BASE_URL,
  const corsOptions = {
    origin: true,
    credentials: true,
  }

  app.use(
    '/graphql',
    cors<cors.CorsRequest>(corsOptions),
    json(),
    expressMiddleware(server, {
      context: async ({ req, res }): Promise<GraphQLContext> => {
        const session = await getSession({ req })
        return { session: session as Session, prisma, pubsub }
      },
    })
  )

  await new Promise<void>(resolve =>
    httpServer.listen({ port: process.env.PORT || 4000 }, resolve)
  )
  console.log(`🚀 Server ready at http://localhost:4000/graphql`)
}

main().catch(err => console.log(err))
