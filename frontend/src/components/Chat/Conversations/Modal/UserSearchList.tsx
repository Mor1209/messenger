import { SearchedUser } from '@/src/util/types'
import React from 'react'

type Props = {
  users: Array<SearchedUser>
  addParticipant: (user: SearchedUser) => void
}

export default function UserSearchList({ users, addParticipant }: Props) {
  return (
    <>
      {users.length === 0 ? (
        <div className='mt-6 flex justify-center text-zinc-200'>
          <p>No users found</p>
        </div>
      ) : (
        <div className='mt-6 flex flex-col'>
          {users.map(user => (
            <div
              key={user.id}
              className='flex items-center gap-4 rounded-md py-2 px-4 hover:bg-gray-700'
            >
              <div className='flex items-center'>
                <span className='inline-block h-12 w-12 overflow-hidden rounded-full bg-gray-100'>
                  <svg
                    className='h-full w-full text-gray-300'
                    fill='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path d='M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z' />
                  </svg>
                </span>
              </div>

              <div className='flex w-full items-center justify-between'>
                <p className='text-sm text-zinc-200'>{user.username}</p>
                <button
                  onClick={() => addParticipant(user)}
                  className='h-9 rounded-md bg-green-700/100 px-4 py-2 text-sm font-medium text-green-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-75 disabled:hover:bg-gray-700'
                >
                  Select
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
