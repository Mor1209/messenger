import { formatUsernames } from '@/src/util/functions'
import { ConversationsData } from '@/src/util/types'
import { useQuery } from '@apollo/client'
import { useRouter } from 'next/router'
import React from 'react'
import ConversationOperations from '../../../../graphql/operations/conversation'

type Props = {
  userId: string
  conversationId: string
}

export default function Header({ userId, conversationId }: Props) {
  const router = useRouter()
  const { data, loading } = useQuery<ConversationsData>(
    ConversationOperations.Queries.conversations
  )

  const conversation = data?.conversations.find(
    conversation => conversation.id === conversationId
  )

  return (
    <div className='flex w-full content-center items-center gap-6 border-b-[1px] border-solid border-gray-800 py-5 px-4'>
      <button
        onClick={() =>
          router.replace('?conversationId', '/', {
            shallow: true,
          })
        }
        className='h-9 rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-75 disabled:hover:bg-gray-700 md:hidden'
      >
        Back
      </button>
      {!conversation && !loading && <p>Conversation Not Found</p>}
      {conversation && (
        <div className='flex'>
          <p className='text-zinc-400'>To:</p>
          <p className='ml-1 font-bold'>
            {formatUsernames(conversation.participants, userId)}
          </p>
        </div>
      )}
    </div>
  )
}
