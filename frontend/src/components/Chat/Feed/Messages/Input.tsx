import { SendMessageArguments } from '@/../backend/src/util/types'
import { MessagesData } from '@/src/util/types'
import { useMutation } from '@apollo/client'
import { Session } from 'next-auth'
import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import MessageOperations from '../../../../graphql/operations/message'
import { v4 as uuidv4 } from 'uuid'

type Props = {
  session: Session
  conversationId: string
}

export default function Input({ session, conversationId }: Props) {
  const [messageBody, setMessageBody] = useState('')
  const [sendMessage] = useMutation<
    { sendMessage: boolean },
    SendMessageArguments
  >(MessageOperations.Mutations.sendMessage)

  const onSendMessage = async (event: React.FormEvent) => {
    event.preventDefault()

    try {
      const { id: senderId } = session.user
      const messageId = uuidv4()
      const newMessage: SendMessageArguments = {
        id: messageId,
        senderId,
        conversationId,
        body: messageBody,
      }

      setMessageBody('')

      const { data, errors } = await sendMessage({
        variables: {
          ...newMessage,
        },
        optimisticResponse: {
          sendMessage: true,
        },
        update: cache => {
          const existing = cache.readQuery<MessagesData>({
            query: MessageOperations.Query.messages,
            variables: { conversationId },
          }) as MessagesData

          cache.writeQuery<MessagesData, { conversationId: string }>({
            query: MessageOperations.Query.messages,
            variables: { conversationId },
            data: {
              ...existing,
              messages: [
                {
                  id: messageId,
                  body: messageBody,
                  senderId: session.user.id,
                  conversationId,
                  sender: {
                    id: session.user.id,
                    username: session.user.username,
                  },
                  createdAt: new Date(Date.now()),
                  updatedAt: new Date(Date.now()),
                },
                ...existing.messages,
              ],
            },
          })
        },
      })

      if (!data?.sendMessage || errors) {
        throw new Error('Failed to send message')
      }
    } catch (error: any) {
      console.log('onMessage error', error)
      toast.error(error?.message)
    }
  }
  return (
    <div className='w-full px-4 py-6'>
      <form onSubmit={onSendMessage}>
        <input
          type='text'
          placeholder='New message'
          value={messageBody}
          onChange={e => setMessageBody(e.target.value)}
          autoComplete='off'
          className='block w-full resize-none rounded-md border-gray-700 bg-gray-800 text-zinc-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
        />
      </form>
    </div>
  )
}
