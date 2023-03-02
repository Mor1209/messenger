import React, { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import UserOperations from '../../../../graphql/operations/user'
import ConversationOperation from '../../../../graphql/operations/conversation'
import {
  createConversationData,
  createConversationInput,
  SearchedUser,
  SearchUsersData,
  SearchUsersInput,
} from '@/src/util/types'
import UserSearchList from './UserSearchList'
import Participants from './Participants'
import { toast } from 'react-hot-toast'
import { Session } from 'next-auth'
import { useRouter } from 'next/router'
import {
  ConversationPopulated,
  ParticipantPopulated,
} from '@/../backend/src/util/types'
import ConversationOperations from '@/src/graphql/operations/conversation'
import ConversationItem from '../ConversationItem'

type Props = {
  isOpen: boolean
  session: Session
  conversations: Array<ConversationPopulated>
  editingConversation: ConversationPopulated | null
  onViewConversation: (
    conversationId: string,
    hasSeenLatestMessage: boolean
  ) => void
  getUserParticipantObject: (
    conversation: ConversationPopulated
  ) => ParticipantPopulated
  onToggle: () => void
}

export default function Modal({
  isOpen,
  session,
  conversations,
  editingConversation,
  onToggle,
  onViewConversation,
  getUserParticipantObject,
}: Props) {
  const {
    user: { id: userId },
  } = session

  const router = useRouter()

  const [username, setUsername] = useState('')
  const [participants, setParticipants] = useState<Array<SearchedUser>>([])
  const usernameInput = useRef<any>()
  const [existingConversation, setExistingConversation] =
    useState<ConversationPopulated | null>(null)

  const [searchUsers, { data, error, loading }] = useLazyQuery<
    SearchUsersData,
    SearchUsersInput
  >(UserOperations.Queries.searchUsers)
  const [createConversation, { loading: createConversationLoading }] =
    useMutation<createConversationData, createConversationInput>(
      ConversationOperation.Mutations.createConversation
    )
  const [updateParticipants, { loading: updateParticipantsLoading }] =
    useMutation<
      { updateParticipants: boolean },
      { conversationId: string; participantIds: Array<string> }
    >(ConversationOperations.Mutations.updateParticipants)

  const onSubmit = () => {
    if (!participants.length) return

    const participantIds = participants.map(p => p.id)

    const existing = findExistingConversation(participantIds)

    if (existing) {
      toast('Conversation already exists')
      setExistingConversation(existing)
      return
    }

    /**
     * Determine which function to call
     */
    editingConversation
      ? onUpdateConversation(editingConversation)
      : onCreateConversation()
  }

  const findExistingConversation = (participantIds: Array<string>) => {
    let existingConversation: ConversationPopulated | null = null

    for (const conversation of conversations) {
      const addedParticipants = conversation.participants.filter(
        (p: { user: { id: string } }) => p.user.id !== userId
      )

      if (addedParticipants.length !== participantIds.length) {
        continue
      }

      let allMatchingParticipants: boolean = false
      for (const participant of addedParticipants) {
        const foundParticipant = participantIds.find(
          p => p === participant.user.id
        )

        if (!foundParticipant) {
          allMatchingParticipants = false
          break
        }

        /**
         * If we hit here,
         * all match
         */
        allMatchingParticipants = true
      }

      if (allMatchingParticipants) {
        existingConversation = conversation
      }
    }

    return existingConversation
  }

  const onCreateConversation = async () => {
    const participantIds = [userId, ...participants.map(p => p.id)]
    try {
      const { data } = await createConversation({
        variables: { participantIds },
      })

      if (!data?.createConversation) {
        throw new Error('Failed to create conversation')
      }

      const {
        createConversation: { conversationId },
      } = data

      router.push({ query: { conversationId } })

      setParticipants([])
      setUsername('')
      onToggle()
    } catch (error: any) {
      console.log('onCreateConversation error', error)
      toast.error(error?.message)
    }
  }

  const onUpdateConversation = async (conversation: ConversationPopulated) => {
    const participantIds = participants.map(p => p.id)

    try {
      const { data, errors } = await updateParticipants({
        variables: {
          conversationId: conversation.id,
          participantIds,
        },
      })

      if (!data?.updateParticipants || errors) {
        throw new Error('Failed to update participants')
      }

      /**
       * Clear state and close modal
       * on successful update
       */
      setParticipants([])
      setUsername('')
      onToggle()
    } catch (error) {
      console.log('onUpdateConversation error', error)
      toast.error('Failed to update participants')
    }
  }

  const onConversationClick = () => {
    if (!existingConversation) return

    const { hasSeenLatestMessage } =
      getUserParticipantObject(existingConversation)

    onViewConversation(existingConversation.id, hasSeenLatestMessage)
    onToggle()
  }

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchUsers({ variables: { username } })
  }

  const addParticipant = (user: SearchedUser) => {
    setParticipants(prev => [...prev, user])
    setUsername('')
  }

  const removeParticipant = (userId: String) => {
    setParticipants(prev => prev.filter(p => p.id !== userId))
  }

  useEffect(() => {
    if (editingConversation) {
      setParticipants(
        editingConversation.participants.map(
          (p: { user: SearchedUser }) => p.user as SearchedUser
        )
      )
      return
    }
  }, [editingConversation])

  /**
   * Reset existing conversation state
   * when participants added/removed
   */
  useEffect(() => {
    setExistingConversation(null)
  }, [participants])

  /**
   * Clear participant state if closed
   */
  useEffect(() => {
    if (!isOpen) {
      setParticipants([])
    }
  }, [isOpen])

  if (error) {
    toast.error('Error searching for users')
    return null
  }

  console.log(editingConversation)

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        initialFocus={usernameInput}
        as='div'
        className='relative z-10'
        onClose={onToggle}
      >
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity' />
        </Transition.Child>

        <div className='fixed inset-0 z-10 overflow-y-auto'>
          <div className='flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
              enterTo='opacity-100 translate-y-0 sm:scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 translate-y-0 sm:scale-100'
              leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
            >
              <Dialog.Panel className='relative transform overflow-hidden rounded-lg bg-gray-800 px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6'>
                <div className='absolute top-0 right-0 pt-4 pr-4'>
                  <button
                    autoFocus={false}
                    className='rounded-md bg-gray-800 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800'
                    onClick={onToggle}
                  >
                    <span className='sr-only'>Close</span>
                    <XMarkIcon className='h-6 w-6' aria-hidden='true' />
                  </button>
                </div>

                <div className='text-center sm:p-5 sm:text-left'>
                  <Dialog.Title
                    as='h3'
                    className='text-lg font-medium leading-6 text-zinc-200'
                  >
                    {editingConversation
                      ? 'Update Conversation'
                      : 'Create a Conversation'}
                  </Dialog.Title>

                  <form onSubmit={e => onSearch(e)} autoComplete='off'>
                    <div className='mt-6 flex flex-col gap-3 bg-slate-800'>
                      <label className='sr-only'>Username</label>
                      <input
                        ref={usernameInput}
                        type='text'
                        placeholder='Enter a username'
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        autoComplete='off'
                        autoFocus
                        className='block w-full rounded-md border-gray-700 bg-gray-800 text-zinc-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                      />
                      <button
                        type='submit'
                        className='h-9 w-full rounded-md bg-gray-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-75 disabled:hover:bg-gray-700'
                        disabled={loading}
                      >
                        {loading ? (
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
                          <>Search</>
                        )}
                      </button>
                    </div>
                  </form>
                  {data?.searchUsers && (
                    <UserSearchList
                      users={data.searchUsers}
                      addParticipant={addParticipant}
                    />
                  )}
                  {participants.length !== 0 && (
                    <>
                      <Participants
                        participants={participants}
                        removeParticipant={removeParticipant}
                      />
                      <div className='mt-4'>
                        {existingConversation && (
                          <ConversationItem
                            toggleScroll={() => {}}
                            userId={userId}
                            conversation={existingConversation}
                            onClick={() => onConversationClick()}
                          />
                        )}
                      </div>
                      <button
                        disabled={!!existingConversation}
                        onClick={onSubmit}
                        className='mt-6 h-9 w-full rounded-md bg-green-700/100 text-sm font-medium text-green-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-75 disabled:hover:bg-gray-700'
                      >
                        {editingConversation
                          ? 'Update Conversation'
                          : 'Create Conversation'}
                      </button>
                    </>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
