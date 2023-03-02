import {
  ConversationPopulated,
  ParticipantPopulated,
} from '@/../backend/src/util/types'
import { Session } from 'next-auth'
import { useRouter } from 'next/router'
import React, { useRef, useState, useContext } from 'react'
import { toast } from 'react-hot-toast'
import ConversationItem from './ConversationItem'
import ConversationModal from './Modal/Modal'
import ConversationOperations from '@/src/graphql/operations/conversation'
import { useMutation } from '@apollo/client'
import { signOut } from 'next-auth/react'
import { ModalContext, ModalContextTypes } from '@/src/context/ModalContext'

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
  const [signOutLoading, setSignOutLoading] = useState(false)
  const { modalOpen, openModal, closeModal } =
    useContext<ModalContextTypes>(ModalContext)

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
    openModal()
  }

  const toggleClose = () => {
    setEditingConversation(null)
    closeModal()
  }

  const sortedConversations = [...conversations].sort(
    (a, b) => b.updatedAt.valueOf() - a.updatedAt.valueOf()
  )

  return (
    <div className='relative h-full w-full text-center text-sm font-medium'>
      <div
        onClick={openModal}
        className='mb-4 cursor-pointer rounded-md bg-slate-900 py-2 px-4'
      >
        <p>Find or start Conversation</p>
      </div>
      <ConversationModal
        isOpen={modalOpen}
        onClose={toggleClose}
        session={session}
        conversations={conversations}
        editingConversation={editingConversation}
        onViewConversation={onViewConversation}
        getUserParticipantObject={getUserParticipantObject}
      />

      {sortedConversations.map(conversation => {
        const { hasSeenLatestMessage } = getUserParticipantObject(conversation)
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

      <div className='absolute bottom-0 left-0 z-20 w-full px-8 py-3'>
        <button
          onClick={() => {
            setSignOutLoading(true)
            signOut()
          }}
          className='h-9 w-full items-center rounded-md bg-slate-900 py-2 px-4 text-center'
        >
          {signOutLoading ? (
            <div role='status'>
              <svg
                aria-hidden='true'
                className='mb-1 inline h-5 w-5 animate-spin fill-zinc-200 text-transparent'
                viewBox='0 0 100 101'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
                  fill='currentColor'
                />
                <path
                  d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
                  fill='currentFill'
                />
              </svg>
              <span className='sr-only'>Loading...</span>
            </div>
          ) : (
            'Logout'
          )}
        </button>
      </div>
    </div>
  )
}
