import { MessagePopulated } from '@/../backend/src/util/types'
import { formatRelative } from 'date-fns'
import enUS from 'date-fns/locale/en-US'
import React from 'react'

type Props = {
  message: MessagePopulated
  sentByMe: boolean
}

const formatRelativeLocale = {
  lastWeek: "eeee 'at' p",
  yesterday: "'Yesterday at' p",
  today: 'p',
  other: 'MM/dd/yy',
}

export default function MessageItem({ message, sentByMe }: Props) {
  return (
    <div
      className={`flex w-full flex-row gap-4 break-words p-4 hover:bg-gray-700 ${
        sentByMe ? 'justify-end' : 'justify-start'
      }`}
    >
      {!sentByMe && (
        <div className='flex justify-end'>
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
      )}
      <div className='flex w-full flex-col gap-1'>
        <div
          className={`flex flex-row items-center ${
            sentByMe ? 'justify-end' : 'justify-start'
          }`}
        >
          {!sentByMe && (
            <p
              className={`pr-2 font-medium ${
                sentByMe ? 'text-right' : 'text-left'
              }`}
            >
              {message.sender.username}
            </p>
          )}
          <p>
            {formatRelative(message.createdAt, new Date(), {
              locale: {
                ...enUS,
                formatRelative: token =>
                  formatRelativeLocale[
                    token as keyof typeof formatRelativeLocale
                  ],
              },
            })}
          </p>
        </div>
        <div
          className={`flex flex-row ${
            sentByMe ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`max-w-[65%] rounded-xl px-2 py-1 ${
              sentByMe
                ? 'bg-green-700/100 text-green-100'
                : 'bg-gray-800 text-zinc-200'
            }`}
          >
            <p>{message.body}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
