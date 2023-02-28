import { Session } from 'next-auth'
import React, { useEffect } from 'react'
import ConversationList from './ConversationList'
import ConversationOperations from '@/src/graphql/operations/conversation'
import { useQuery } from '@apollo/client'
import { ConversationsData } from '../../../util/types'
import { toast } from 'react-hot-toast'
import { ConversationPopulated } from '@/../backend/src/util/types'
import { useRouter } from 'next/router'
import SkeletonLoader from '../../common/SkeletonLoader'

type Props = {
  session: Session
}

export default function ConversationWrapper({ session }: Props) {
  const {
    data: conversationsData,
    error: conversationsError,
    loading: conversationsLoading,
    subscribeToMore,
  } = useQuery<ConversationsData>(
    ConversationOperations.Queries.conversations,
    {
      onError: ({ message }) => {
        toast.error(message)
      },
    }
  )
  const router = useRouter()
  const {
    query: { conversationId },
  } = router

  const onViewConversation = async (conversationId: string) => {
    router.push({ query: { conversationId } })
  }

  const subscribeToNewConversations = () => {
    subscribeToMore({
      document: ConversationOperations.Subscriptions.conversationCreated,
      updateQuery: (
        prev,
        {
          subscriptionData,
        }: {
          subscriptionData: {
            data: { conversationCreated: ConversationPopulated }
          }
        }
      ) => {
        if (!subscriptionData.data) return prev

        const newConversation = subscriptionData.data.conversationCreated

        return Object.assign({}, prev, {
          conversations: [newConversation, ...prev.conversations],
        })
      },
    })
  }

  useEffect(() => {
    subscribeToNewConversations()
  }, [])

  return (
    <div
      className={`w-screen gap-4 bg-gray-800 px-3 py-6 md:flex md:w-[30%] md:min-w-[300px] md:flex-col ${
        conversationId ? 'hidden' : 'flex'
      }`}
    >
      {conversationsLoading ? (
        <SkeletonLoader count={8} height='h-[80px]' />
      ) : (
        <ConversationList
          session={session}
          conversations={conversationsData?.conversations || []}
          onViewConversation={onViewConversation}
        />
      )}
    </div>
  )
}
