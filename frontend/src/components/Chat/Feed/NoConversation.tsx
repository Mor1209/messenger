import React, { useContext } from 'react'
import { ConversationsData } from '../../../util/types'
import ConversationOperations from '../../../graphql/operations/conversation'
import { useQuery } from '@apollo/client'
import { ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline'
import { ModalContext, ModalContextTypes } from '@/src/context/ModalContext'

type Props = {}

export default function NoConversation({}: Props) {
  const { data, loading, error } = useQuery<ConversationsData>(
    ConversationOperations.Queries.conversations
  )
  const { openModal } = useContext<ModalContextTypes>(ModalContext)

  if (!data?.conversations || loading || error) return null

  const { conversations } = data

  const hasConversations = conversations.length

  const text = hasConversations
    ? 'Select a Conversation'
    : "Let's Get Started 🥳"

  return (
    <div className='flex h-full w-full items-center justify-center'>
      <div className='flex flex-col items-center justify-center gap-10'>
        <p className='text-4xl text-gray-200'>{text}</p>
        {hasConversations ? (
          <ChatBubbleLeftEllipsisIcon className='h-20 w-20 text-gray-200' />
        ) : (
          <button
            onClick={openModal}
            className='rounded-md bg-gray-600 px-4 py-2'
          >
            Create a Conversation
          </button>
        )}
      </div>
    </div>
  )
}
