import { Session } from 'next-auth'
import { useRouter } from 'next/router'
import React from 'react'
import Header from './Messages/Header'
import Input from './Messages/Input'
import Messages from './Messages/Messages'
import NoConversation from './NoConversation'

type Props = {
  session: Session
}

export default function FeedWrapper({ session }: Props) {
  const router = useRouter()

  const { conversationId } = router.query

  return (
    <div
      className={`w-screen overflow-hidden md:flex md:w-[70%] ${
        conversationId ? 'flex flex-col' : 'hidden'
      }`}
    >
      {conversationId && typeof conversationId === 'string' ? (
        <>
          <div className='flex flex-grow flex-col justify-between overflow-hidden'>
            <Header userId={session.user.id} conversationId={conversationId} />
            <Messages
              userId={session.user.id}
              conversationId={conversationId}
            />
          </div>
          <Input session={session} conversationId={conversationId} />
        </>
      ) : (
        <NoConversation />
      )}
    </div>
  )
}
