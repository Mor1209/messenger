import { ConversationPopulated } from '@/../backend/src/util/types'
import { Session } from 'next-auth'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import ConversationItem from './ConversationItem'
import ConversationModal from './Modal/Modal'

type Props = {
  session: Session
  conversations: Array<ConversationPopulated>
  onViewConversation: (conversationId: string) => void
}

export default function ConversationList({
  session,
  conversations,
  onViewConversation,
}: Props) {
  const router = useRouter()
  const [openModal, setOpenModal] = useState(false)

  const toggleModal = () => {
    setOpenModal(prev => !prev)
  }

  return (
    <div className='w-full text-center text-sm font-medium'>
      <div
        onClick={toggleModal}
        className='mb-4 cursor-pointer rounded-md bg-slate-900 py-2 px-4'
      >
        <p>Find or start Conversation</p>
      </div>
      <ConversationModal
        isOpen={openModal}
        onToggle={toggleModal}
        session={session}
      />
      {conversations.map(conversation => (
        <ConversationItem
          key={conversation.id}
          userId={session.user.id}
          conversation={conversation}
          hasSeenLatestMessage={false}
          selectedConversationId={router.query.conversationId as string}
          onClick={() => onViewConversation(conversation.id)}
          onEditConversation={() => {}}
          onDeleteConversation={() => {}}
          onLeaveConversation={() => {}}
        />
      ))}
    </div>
  )
}
