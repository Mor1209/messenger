import { Session } from 'next-auth'
import { useRouter } from 'next/router'
import React from 'react'

type Props = {
  session: Session
}

export default function FeedWrapper({ session }: Props) {
  const router = useRouter()

  const { conversationId } = router.query

  return (
    <div
      className={`w-full flex-col ${
        conversationId ? 'hidden md:flex' : 'flex'
      }`}
    >
      {conversationId ? (
        <div className='flex'>{conversationId}</div>
      ) : (
        <div>No conversation selected</div>
      )}
    </div>
  )
}
