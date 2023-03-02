import {
  ConversationPopulated,
  ParticipantPopulated,
} from '@/../backend/src/util/types'
import { Session } from 'next-auth'
import { useRouter } from 'next/router'
import React, { useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import ConversationItem from './ConversationItem'
import ConversationModal from './Modal/Modal'
import ConversationOperations from '@/src/graphql/operations/conversation'
import { useMutation } from '@apollo/client'

type Props = {
  session: Session
  conversations: Array<ConversationPopulated>
  onViewConversation: (
    conversationId: string,
    hasSeenLatestMessage: boolean
  ) => void
  toggleScroll: () => void
}

export default function ConversationList({
  session,
  conversations,
  onViewConversation,
  toggleScroll,
}: Props) {
  const router = useRouter()
  const {
    user: { id: userId },
  } = session
  const [editingConversation, setEditingConversation] =
    useState<ConversationPopulated | null>(null)
  const [openModal, setOpenModal] = useState(false)

  /**
   * Mutations
   */
  const [updateParticipants, { loading: updateParticipantsLoading }] =
    useMutation<
      { updateParticipants: boolean },
      { conversationId: string; participantIds: Array<string> }
    >(ConversationOperations.Mutations.updateParticipants)

  const [deleteConversation] = useMutation<
    { deleteConversation: boolean },
    { conversationId: string }
  >(ConversationOperations.Mutations.deleteConversation)

  const onLeaveConversation = async (conversation: ConversationPopulated) => {
    const participantIds = conversation.participants
      .filter((p: { user: { id: string } }) => p.user.id !== userId)
      .map((p: { user: { id: any } }) => p.user.id)

    try {
      const { data, errors } = await updateParticipants({
        variables: {
          conversationId: conversation.id,
          participantIds,
        },
      })

      if (!data || errors) {
        throw new Error('Failed to update participants')
      }
    } catch (error: any) {
      console.log('onUpdateConversation error', error)
      toast.error(error?.message)
    }
  }

  const onDeleteConversation = async (conversationId: string) => {
    try {
      toast.promise(
        deleteConversation({
          variables: {
            conversationId,
          },
          update: () => {
            router.replace(
              typeof process.env.NEXT_PUBLIC_BASE_URL === 'string'
                ? process.env.NEXT_PUBLIC_BASE_URL
                : ''
            )
          },
        }),
        {
          loading: 'Deleting conversation',
          success: 'Conversation deleted',
          error: 'Failed to delete conversation',
        }
      )
    } catch (error) {
      console.log('onDeleteConversation error', error)
    }
  }

  const getUserParticipantObject = (conversation: ConversationPopulated) => {
    return conversation.participants.find(
      (p: { user: { id: string } }) => p.user.id === session.user.id
    ) as ParticipantPopulated
  }

  const onEditConversation = (conversation: ConversationPopulated) => {
    setEditingConversation(conversation)
    setOpenModal(true)
  }

  const toggleModal = () => {
    setOpenModal(prev => !prev)
    setEditingConversation(null)
  }

  const sortedConversations = [...conversations].sort(
    (a, b) => b.updatedAt.valueOf() - a.updatedAt.valueOf()
  )

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
        conversations={conversations}
        editingConversation={editingConversation}
        onViewConversation={onViewConversation}
        getUserParticipantObject={getUserParticipantObject}
      />
      <div className='flex flex-col gap-4'>
        {sortedConversations.map(conversation => {
          const { hasSeenLatestMessage } =
            getUserParticipantObject(conversation)
          return (
            <ConversationItem
              key={conversation.id}
              userId={session.user.id}
              conversation={conversation}
              toggleScroll={toggleScroll}
              hasSeenLatestMessage={hasSeenLatestMessage}
              selectedConversationId={router.query.conversationId as string}
              onClick={() =>
                onViewConversation(conversation.id, hasSeenLatestMessage)
              }
              onEditConversation={() => onEditConversation(conversation)}
              onDeleteConversation={onDeleteConversation}
              onLeaveConversation={onLeaveConversation}
            />
          )
        })}
      </div>
    </div>
  )
}
