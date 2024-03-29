import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  split,
  createHttpLink,
} from '@apollo/client'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient } from 'graphql-ws'
import { getSession } from 'next-auth/react'

const wsLink =
  typeof window !== 'undefined'
    ? new GraphQLWsLink(
        createClient({
          url: `ws${process.env.NODE_ENV === 'production' ? 's' : ''}://${
            process.env.NEXT_PUBLIC_BACKEND_URL
          }/graphql/subscriptions`,
          connectionParams: async () => ({
            session: await getSession(),
          }),
        })
      )
    : null

const httpLink = createHttpLink({
  uri: `http${process.env.NODE_ENV === 'production' ? 's' : ''}://${
    process.env.NEXT_PUBLIC_BACKEND_URL
  }/graphql`,
  credentials: 'include',
})

const link =
  typeof window !== 'undefined' && wsLink != null
    ? split(
        ({ query }) => {
          const def = getMainDefinition(query)
          return (
            def.kind === 'OperationDefinition' &&
            def.operation === 'subscription'
          )
        },
        wsLink,
        httpLink
      )
    : httpLink

export const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
})
