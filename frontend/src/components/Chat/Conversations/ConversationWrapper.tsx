import { Session } from 'next-auth'
import React from 'react'
import ConversationList from './ConversationList'
import ConversationOperations from '@/src/graphql/operations/conversation'
import { useQuery } from '@apollo/client'
import { ConversationsData } from '../../../util/types'
import { toast } from 'react-hot-toast'

type Props = {
  session: Session
}

export default function ConversationWrapper({ session }: Props) {
  const {
    data: conversationsData,
    error: conversationsError,
    loading: conversationsLoading,
  } = useQuery<ConversationsData, any>(
    ConversationOperations.Queries.conversations,
    {
      onError: ({ message }) => {
        toast.error(message)
      },
    }
  )

  console.log('Data conversations: ', conversationsData)

  return (
    <div className='w-max bg-gray-800 px-3 py-6 md:w-1/3'>
      <ConversationList
        session={session}
        conversations={conversationsData?.conversations || []}
      />
    </div>
  )
}
