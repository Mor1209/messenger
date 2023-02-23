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

async function main() {
  interface MyContext {
    token?: String
  }

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  })

  const app = express()
  const httpServer = http.createServer(app)
  const server = new ApolloServer<MyContext>({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ],
  })
  await server.start()
  app.use(
    '/graphql',
    cors<cors.CorsRequest>({
      origin: ['https://www.your-app.example', 'http://localhost:3000/'],
    }),
    json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({ token: req.headers.token }),
    })
  )

  await new Promise<void>(resolve => httpServer.listen({ port: 4000 }, resolve))
  console.log(`🚀 Server ready at http://localhost:4000/graphql`)
}

main().catch(err => console.log(err))
