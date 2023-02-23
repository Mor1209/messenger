import { signOut } from 'next-auth/react'
import React from 'react'

type Props = {}

export default function Chat({}: Props) {
  return (
    <div className='flex h-screen items-center justify-center'>
      <div>
        Chat
        <button
          onClick={() => signOut()}
          className='w-full rounded-md bg-gray-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-gray-600 focus:z-10'
        >
          Logout
        </button>
      </div>
    </div>
  )
}
