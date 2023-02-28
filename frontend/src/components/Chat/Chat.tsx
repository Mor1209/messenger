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
      <ConversationWrapper session={session} />
      <FeedWrapper session={session} />
      {/* <button
        onClick={() => signOut()}
        className='w-full rounded-md bg-gray-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-gray-600 focus:z-10'
      >
        Logout
      </button> */}
    </div>
  )
}
