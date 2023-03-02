import { SearchedUser } from '@/src/util/types'
import React from 'react'

type Props = {
  participants: Array<SearchedUser>
  removeParticipant: (userId: String) => void
}

export default function Participants({
  participants,
  removeParticipant,
}: Props) {
  return (
    <div className='mt-8 flex flex-wrap gap-2'>
      {participants.map(participant => (
        <div
          key={participant.id}
          className='flex items-center justify-center gap-2 rounded-md bg-gray-700 p-2'
        >
          <p className='text-zinc-200'>{participant.username}</p>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth='1.5'
            stroke='#e5e7eb'
            className='mt-[2px] h-5 w-5 cursor-pointer'
            onClick={() => removeParticipant(participant.id)}
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
            />
          </svg>
        </div>
      ))}
    </div>
  )
}
