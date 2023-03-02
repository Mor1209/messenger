import ConversationModalProvider from '@/src/context/ModalContext'
import { Session } from 'next-auth'
import { signOut } from 'next-auth/react'
import React from 'react'
import ConversationWrapper from './Conversations/ConversationWrapper'
import FeedWrapper from './Feed/FeedWrapper'

type Props = {
  session: Session
}

export default function Chat({ session }: Props) {
  return (
    <div className='flex h-screen w-full'>
      <ConversationModalProvider>
        <ConversationWrapper session={session} />
        <FeedWrapper session={session} />
      </ConversationModalProvider>
    </div>
  )
}
