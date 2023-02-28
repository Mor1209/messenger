import { ConversationPopulated } from '@/../backend/src/util/types'
import { formatUsernames } from '@/src/util/functions'
import { Menu } from '@headlessui/react'
import React, { useState } from 'react'
import { formatRelative } from 'date-fns'
import enUS from 'date-fns/locale/en-US'

const formatRelativeLocale = {
  lastWeek: 'eeee',
  yesterday: "'Yesterday",
  today: 'p',
  other: 'MM/dd/yy',
}

type Props = {
  userId: string
  conversation: ConversationPopulated
  onClick: () => void
  onEditConversation?: () => void
  hasSeenLatestMessage?: boolean
  selectedConversationId?: string
  onDeleteConversation?: (conversationId: string) => void
  onLeaveConversation?: (conversation: ConversationPopulated) => void
}

export default function ConversationItem({
  userId,
  conversation,
  selectedConversationId,
  hasSeenLatestMessage,
  onClick,
  onEditConversation,
  onDeleteConversation,
  onLeaveConversation,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false)

  const handleClick = (event: React.MouseEvent) => {
    if (event.type === 'click') {
      onClick()
    } else if (event.type === 'contextmenu') {
      event.preventDefault()
      setMenuOpen(true)
    }
  }

  const showMenu =
    onEditConversation && onDeleteConversation && onLeaveConversation

  return (
    <div
      onClick={handleClick}
      onContextMenu={handleClick}
      className={`relative flex cursor-pointer items-center justify-between rounded-md p-4 hover:bg-gray-700 ${
        conversation.id === selectedConversationId ? 'bg-gray-700' : ''
      }`}
    >
      {showMenu && (
        <Menu>
          {({ open }) => (
            <>
              {menuOpen && (
                <Menu.Items className="bg-['#2d2d2d']">
                  <Menu.Item>
                    <button
                      onClick={event => {
                        event.stopPropagation()
                        onEditConversation()
                      }}
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                        strokeWidth='1.5'
                        stroke='currentColor'
                        className='h-6 w-6'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          d='M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125'
                        />
                      </svg>
                      Edit
                    </button>
                  </Menu.Item>
                  {conversation.participants.length > 2 ? (
                    <Menu.Item>
                      <button
                        onClick={event => {
                          event.stopPropagation()
                          onLeaveConversation(conversation)
                        }}
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 24 24'
                          strokeWidth='1.5'
                          stroke='currentColor'
                          className='h-6 w-6'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            d='M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75'
                          />
                        </svg>
                        Leave
                      </button>
                    </Menu.Item>
                  ) : (
                    <Menu.Item>
                      <button
                        onClick={event => {
                          event.stopPropagation()
                          onDeleteConversation(conversation.id)
                        }}
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 24 24'
                          strokeWidth='1.5'
                          stroke='currentColor'
                          className='h-6 w-6'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            d='M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0'
                          />
                        </svg>
                        Delete
                      </button>
                    </Menu.Item>
                  )}
                </Menu.Items>
              )}
            </>
          )}
        </Menu>
      )}
      <span className='inline-block h-12 w-12 overflow-hidden rounded-full bg-gray-100'>
        <svg
          className='h-full w-full text-gray-300'
          fill='currentColor'
          viewBox='0 0 24 24'
        >
          <path d='M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z' />
        </svg>
      </span>
      <div className='flex h-full w-[80%] items-center justify-between'>
        <div className='flex h-full w-[70%] flex-col'>
          <p className='text overflow-hidden overflow-ellipsis whitespace-nowrap text-left font-bold'>
            {formatUsernames(conversation.participants, userId)}
          </p>
          {conversation.latestMessage && (
            <div className='w-[140%]'>
              <p className='overflow-hidden overflow-ellipsis whitespace-nowrap'>
                {conversation.latestMessage.body}
              </p>
            </div>
          )}
        </div>
        <div>
          <p className='text-right'>
            {formatRelative(new Date(conversation.updatedAt), new Date(), {
              locale: {
                ...enUS,
                formatRelative: token =>
                  formatRelativeLocale[
                    token as keyof typeof formatRelativeLocale
                  ],
              },
            })}
          </p>
          <div className='flex justify-end'>
            {hasSeenLatestMessage === false && (
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth='1.5'
                stroke='currentColor'
                className='h-5 w-5'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88'
                />
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
