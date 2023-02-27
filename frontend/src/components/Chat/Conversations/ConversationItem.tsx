import { ConversationPopulated } from '@/../backend/src/util/types'
import React from 'react'

type Props = {
  conversation: ConversationPopulated
}

export default function ConversationItem({ conversation }: Props) {
  return (
    <div className='flex flex-col rounded-md p-4 hover:bg-gray-700'>
      <p>{conversation.id}</p>
    </div>
  )
}
