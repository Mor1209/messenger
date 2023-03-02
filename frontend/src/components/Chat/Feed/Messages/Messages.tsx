import {
  MessagesData,
  MessageSubscriptionData,
  MessageVariables,
} from '@/src/util/types'
import { useQuery } from '@apollo/client'
import React, { useEffect } from 'react'
import MessageOperations from '@/src/graphql/operations/message'
import { toast } from 'react-hot-toast'
import SkeletonLoader from '@/src/components/common/SkeletonLoader'
import MessageItem from './MessageItem'

type Props = {
  userId: string
  conversationId: string
}

export default function Messages({ userId, conversationId }: Props) {
  const { data, loading, error, subscribeToMore } = useQuery<
    MessagesData,
    MessageVariables
  >(MessageOperations.Query.messages, {
    variables: {
      conversationId,
    },
    onError: ({ message }) => {
      toast.error(message)
    },
  })

  const subscribeToMoreMessages = (conversationId: string) => {
    subscribeToMore({
      document: MessageOperations.Subscriptions.messageSent,
      variables: {
        conversationId,
      },
      updateQuery: (prev, { subscriptionData }: MessageSubscriptionData) => {
        if (!subscriptionData) return prev

        const newMessage = subscriptionData.data.messageSent

        return Object.assign({}, prev, {
          messages:
            newMessage.sender.id === userId
              ? prev.messages
              : [newMessage, ...prev.messages],
        })
      },
    })
  }

  useEffect(() => {
    subscribeToMoreMessages(conversationId)
  }, [conversationId])

  if (error) {
    return null
  }

  return (
    <div className='flex w-full flex-col justify-end overflow-hidden'>
      {loading && (
        <div className='flex flex-col gap-4 p-4'>
          <SkeletonLoader count={4} height={'h-[60px]'} />
        </div>
      )}
      {data?.messages && (
        <div className='overflow flex h-full flex-col-reverse overflow-x-hidden overflow-y-scroll'>
          {data.messages.map(message => (
            <MessageItem
              key={message.id}
              message={message}
              sentByMe={message.sender.id === userId}
            />
          ))}
        </div>
      )}
    </div>
  )
}
