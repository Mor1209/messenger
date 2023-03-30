import { Session } from 'next-auth'
import React, { useEffect, useRef, useState } from 'react'
import ConversationList from './ConversationList'
import ConversationOperations from '@/src/graphql/operations/conversation'
import MessageOperations from '@/src/graphql/operations/message'
import { gql, useMutation, useQuery, useSubscription } from '@apollo/client'
import {
  ConversationDeletedData,
  ConversationsData,
  ConversationUpdatedData,
  MessagesData,
} from '../../../util/types'
import { toast } from 'react-hot-toast'
import {
  ConversationPopulated,
  ParticipantPopulated,
} from '@/../backend/src/util/types'
import { useRouter } from 'next/router'
import SkeletonLoader from '../../common/SkeletonLoader'

type Props = {
  session: Session
}

function preventScroll(e: any) {
  e.preventDefault()
  e.stopPropagation()

  return false
}

function preventKeyBoardScroll(e: any) {
  var keys = [32, 33, 34, 35, 37, 38, 39, 40]
  if (keys.includes(e.keyCode)) {
    e.preventDefault()
    return false
  }
}

export default function ConversationWrapper({ session }: Props) {
  const router = useRouter()
  const {
    query: { conversationId },
  } = router
  const {
    user: { id: userId },
  } = session
  const [isScrollEnabled, setIsScrollEnabled] = useState(true)
  const conversationWrapperRef = useRef<HTMLDivElement>(null)

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

  const [markConversationAsRead] = useMutation<
    { markConversationAsRead: boolean },
    { userId: string; conversationId: string }
  >(ConversationOperations.Mutations.markConversationAsRead)

  useSubscription<ConversationUpdatedData>(
    ConversationOperations.Subscriptions.conversationUpdated,
    {
      onData: ({ client, data }) => {
        const { data: subscriptionData } = data

        if (!subscriptionData) return

        const {
          conversationUpdated: {
            conversation: updatedConversation,
            addedUserIds,
            removedUserIds,
          },
        } = subscriptionData

        const { id: updatedConversationId, latestMessage } = updatedConversation

        /**
         * Check if user is being removed
         */
        if (removedUserIds && removedUserIds.length) {
          const isBeingRemoved = removedUserIds.find(id => id === userId)

          if (isBeingRemoved) {
            const conversationsData = client.readQuery<ConversationsData>({
              query: ConversationOperations.Queries.conversations,
            })

            if (!conversationsData) return

            client.writeQuery<ConversationsData>({
              query: ConversationOperations.Queries.conversations,
              data: {
                conversations: conversationsData.conversations.filter(
                  c => c.id !== updatedConversationId
                ),
              },
            })

            if (conversationId === updatedConversationId) {
              router.replace(
                typeof process.env.NEXT_PUBLIC_BASE_URL === 'string'
                  ? process.env.NEXT_PUBLIC_BASE_URL
                  : ''
              )
            }

            /**
             * Early return - no more updates required
             */
            return
          }
        }

        /**
         * Check if user is being added to conversation
         */
        if (addedUserIds && addedUserIds.length) {
          const isBeingAdded = addedUserIds.find(id => id === userId)

          if (isBeingAdded) {
            const conversationsData = client.readQuery<ConversationsData>({
              query: ConversationOperations.Queries.conversations,
            })

            if (!conversationsData) return

            client.writeQuery<ConversationsData>({
              query: ConversationOperations.Queries.conversations,
              data: {
                conversations: [
                  ...(conversationsData.conversations || []),
                  updatedConversation,
                ],
              },
            })
          }
        }

        /**
         * Already viewing conversation where
         * new message is received; no need
         * to manually update cache due to
         * message subscription
         */
        if (updatedConversationId === conversationId) {
          onViewConversation(conversationId as string, false)
          return
        }

        const existing = client.readQuery<MessagesData>({
          query: MessageOperations.Query.messages,
          variables: { conversationId: updatedConversationId },
        })

        if (!existing) return

        /**
         * Check if lastest message is already present
         * in the message query
         */
        const hasLatestMessage = existing.messages.find(
          m => m.id === latestMessage.id
        )

        /**
         * Update query as re-fetch won't happen if you
         * view a conversation you've already viewed due
         * to caching
         */
        if (!hasLatestMessage) {
          client.writeQuery<MessagesData>({
            query: MessageOperations.Query.messages,
            variables: { conversationId: updatedConversationId },
            data: {
              ...existing,
              messages: [latestMessage, ...existing.messages],
            },
          })
        }
      },
    }
  )

  useSubscription<ConversationDeletedData>(
    ConversationOperations.Subscriptions.conversationDeleted,
    {
      onData: ({ client, data }) => {
        const { data: subscriptionData } = data

        if (!subscriptionData) return

        const existing = client.readQuery<ConversationsData>({
          query: ConversationOperations.Queries.conversations,
        })

        if (!existing) return

        const { conversations } = existing
        const {
          conversationDeleted: { id: deletedConversationId },
        } = subscriptionData

        client.writeQuery<ConversationsData>({
          query: ConversationOperations.Queries.conversations,
          data: {
            conversations: conversations.filter(
              conversation => conversation.id !== deletedConversationId
            ),
          },
        })

        router.push('/')
      },
    }
  )

  const onViewConversation = async (
    conversationId: string,
    hasSeenLatestMessage: boolean | undefined
  ) => {
    router.push({ query: { conversationId } })

    if (hasSeenLatestMessage || !conversationId) return

    try {
      await markConversationAsRead({
        variables: {
          userId,
          conversationId,
        },
        optimisticResponse: {
          markConversationAsRead: true,
        },
        update: cache => {
          const participantsFragment = cache.readFragment<{
            participants: Array<ParticipantPopulated>
          }>({
            id: `Conversation:${conversationId}`,
            fragment: gql`
              fragment Participants on Conversation {
                participants {
                  user {
                    id
                    username
                  }
                  hasSeenLatestMessage
                }
              }
            `,
          })

          if (!participantsFragment) return

          /**
           * Create copy to allow mutation
           */
          const participants = [...participantsFragment.participants]

          const userParticipantIdx = participants.findIndex(
            p => p.user.id === userId
          )

          if (userParticipantIdx === -1) return

          const userParticipant = participants[userParticipantIdx]

          /**
           * Update user to show latest message as read
           */
          participants[userParticipantIdx] = {
            ...userParticipant,
            hasSeenLatestMessage: true,
          }

          /**
           * Update cache
           */
          cache.writeFragment({
            id: `Conversation:${conversationId}`,
            fragment: gql`
              fragment UpdatedParticipants on Conversation {
                participants
              }
            `,
            data: {
              participants,
            },
          })
        },
      })
    } catch (error: any) {
      console.log('onViewConversation error', error)
    }
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

  const toggleScroll = () => setIsScrollEnabled(prev => !prev)

  useEffect(() => {
    if (!isScrollEnabled) {
      conversationWrapperRef?.current?.addEventListener('wheel', preventScroll)
      conversationWrapperRef?.current?.addEventListener(
        'keydown',
        preventKeyBoardScroll
      )
      conversationWrapperRef?.current?.addEventListener(
        'touchmove',
        preventScroll
      )
    }
    return () => {
      conversationWrapperRef?.current?.removeEventListener(
        'wheel',
        preventScroll
      )
      conversationWrapperRef?.current?.removeEventListener(
        'keydown',
        preventKeyBoardScroll
      )
      conversationWrapperRef?.current?.removeEventListener(
        'touchmove',
        preventScroll
      )
    }
  }, [isScrollEnabled])

  return (
    <div
      ref={conversationWrapperRef}
      className={`w-screen flex-col gap-4 overflow-y-scroll bg-gray-800 px-3 py-6 md:flex md:w-[30%] md:min-w-[300px] ${
        conversationId ? 'hidden' : 'flex'
      }`}
    >
      {conversationsLoading ? (
        <SkeletonLoader count={8} height='h-[80px]' />
      ) : (
        <ConversationList
          toggleScroll={toggleScroll}
          session={session}
          conversations={conversationsData?.conversations || []}
          onViewConversation={onViewConversation}
        />
      )}
    </div>
  )
}
