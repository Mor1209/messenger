import React, { useContext } from 'react'
import { ConversationsData } from '../../../util/types'
import ConversationOperations from '../../../graphql/operations/conversation'
import { useQuery } from '@apollo/client'
// import { IModalContext, ModalContext } from '../../../context/ModalContext'
import { ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline'

type Props = {}

export default function NoConversation({}: Props) {
  const { data, loading, error } = useQuery<ConversationsData>(
    ConversationOperations.Queries.conversations
  )
  // const { openModal } = useContext<IModalContext>(ModalContext)

  if (!data?.conversations || loading || error) return null

  const { conversations } = data

  const hasConversations = conversations.length

  const text = hasConversations
    ? 'Select a Conversation'
    : "Let's Get Started 🥳"

  return (
    <div className='flex h-full items-center justify-center'>
      <div className='flex items-center gap-10'>
        <p className='text-4xl text-gray-200'>{text}</p>
        {hasConversations ? (
          <ChatBubbleLeftEllipsisIcon className='h-20 w-20 text-gray-200' />
        ) : (
          <button onClick={() => {}}>Create Conversation</button>
        )}
      </div>
    </div>
  )
}
