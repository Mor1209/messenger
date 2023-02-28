import { SendMessageArguments } from '@/../backend/src/util/types'
import { useMutation } from '@apollo/client'
import { Session } from 'next-auth'
import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import MessageOperations from '../../../../graphql/operations/message'

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
      const newMessage: SendMessageArguments = {
        senderId,
        conversationId,
        body: messageBody,
      }

      const { data, errors } = await sendMessage({
        variables: {
          ...newMessage,
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
