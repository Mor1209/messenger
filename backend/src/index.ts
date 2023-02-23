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
import { GraphQLContext, Session } from './util/types'
import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

async function main() {
  dotenv.config()

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  })

  const app = express()
  const httpServer = http.createServer(app)
  const server = new ApolloServer<GraphQLContext>({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  })
  await server.start()

  const corsOptions = {
    origin: process.env.BASE_URL,
    credentials: true,
  }

  const prisma = new PrismaClient()

  app.use(
    '/graphql',
    cors<cors.CorsRequest>(corsOptions),
    json(),
    expressMiddleware(server, {
      context: async ({ req, res }): Promise<GraphQLContext> => {
        const session = await getSession({ req })
        return { session: session as Session, prisma }
      },
    })
  )

  await new Promise<void>(resolve => httpServer.listen({ port: 4000 }, resolve))
  console.log(`🚀 Server ready at http://localhost:4000/graphql`)
}

main().catch(err => console.log(err))
