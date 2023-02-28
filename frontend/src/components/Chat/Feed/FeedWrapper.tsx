import { Session } from 'next-auth'
import { useRouter } from 'next/router'
import React from 'react'
import Header from './Messages/Header'

type Props = {
  session: Session
}

export default function FeedWrapper({ session }: Props) {
  const router = useRouter()

  const { conversationId } = router.query

  return (
    <div
      className={`w-full flex-col ${
        conversationId ? 'flex' : 'hidden md:flex'
      }`}
    >
      {conversationId && typeof conversationId === 'string' ? (
        <div className='flex flex-grow flex-col justify-between overflow-hidden'>
          <Header userId={session.user.id} conversationId={conversationId} />
        </div>
      ) : (
        <div>No conversation selected</div>
      )}
    </div>
  )
}
