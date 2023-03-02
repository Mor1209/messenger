import { ConversationPopulated } from '@/../backend/src/util/types'
import { formatUsernames } from '@/src/util/functions'
import { Menu, Popover, Transition } from '@headlessui/react'
import React, { useEffect, useRef, useState } from 'react'
import { formatRelative } from 'date-fns'
import enUS from 'date-fns/locale/en-US'
import {
  PencilIcon,
  ArrowLeftOnRectangleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { useWindowSize } from '@/src/hooks/useWindowSize'

const formatRelativeLocale = {
  lastWeek: 'eeee',
  yesterday: "'Yesterday",
  today: 'p',
  other: 'MM/dd/yy',
}

type Props = {
  userId: string
  conversation: ConversationPopulated
  toggleScroll: () => void
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
  toggleScroll,
  onClick,
  onEditConversation,
  onDeleteConversation,
  onLeaveConversation,
}: Props) {
  const [menuOpen, setMenuOpen] = useState<{ x: number; y: number } | null>(
    null
  )
  const menuRef = useRef<HTMLElement | null>(null)

  const windowSize = useWindowSize()

  function preventScroll(e: any) {
    e.preventDefault()
    e.stopPropagation()

    return false
  }

  const handleClick = (event: React.MouseEvent) => {
    if (event.type === 'click') {
      onClick()
    } else if (event.type === 'contextmenu') {
      event.preventDefault()

      // Disable scrolling on all parent elements of the popover
      // if (conversationWrapperRef.current?.parentElement) {
      //   conversationWrapperRef.current?.parentElement.addEventListener(
      //     'wheel',
      //     preventScroll
      //   )
      // }

      const x = event.clientX
      const y = event.clientY
      setMenuOpen({ x, y })
      toggleScroll()
    }
  }

  const handleClosePopover = () => {
    // if (conversationWrapperRef.current?.parentElement) {
    //   conversationWrapperRef.current?.parentElement.removeEventListener(
    //     'wheel',
    //     preventScroll
    //   )
    // }
    setMenuOpen(null)
    toggleScroll()
  }

  const showMenu =
    onEditConversation && onDeleteConversation && onLeaveConversation

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        handleClosePopover()
      }
    }
    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  return (
    <div
      onClick={handleClick}
      onContextMenu={handleClick}
      className={`relative flex cursor-pointer items-center justify-between rounded-md p-4 hover:bg-gray-700 ${
        conversation.id === selectedConversationId ? 'bg-gray-700' : ''
      }`}
    >
      {menuOpen && showMenu && (
        <Transition
          appear={true}
          show={true}
          enter='transition ease-in-out duration-300 transform'
          enterFrom='opacity-0 scale-80'
          enterTo='opacity-100 scale-100'
          leave='transition ease-in duration-200 transform'
          leaveFrom='opacity-100 scale-100'
          leaveTo='opacity-0 scale-80'
          className={`fixed z-10`}
          style={{ top: menuOpen.y, left: menuOpen.x }}
        >
          <Popover as='div' ref={menuRef} className='relative'>
            {({ open }) => (
              <>
                <Popover.Panel
                  static
                  className={`fixed z-10 w-48 ${
                    windowSize?.height &&
                    windowSize?.height / 2 < menuOpen.y &&
                    '-translate-y-full'
                  } rounded-lg border-zinc-400 bg-zinc-800 p-3 shadow-lg ring-1 ring-zinc-600`}
                >
                  <div className='flex flex-col space-y-2'>
                    <button
                      type='button'
                      className='flex items-center space-x-3 rounded-md px-4 py-2 hover:bg-zinc-600'
                      onClick={event => {
                        event.stopPropagation()
                        handleClosePopover()
                        onEditConversation()
                      }}
                    >
                      <PencilIcon className='h-5 w-5 text-gray-400' />
                      <span>Edit</span>
                    </button>
                    {conversation.participants.length > 2 ? (
                      <button
                        type='button'
                        className='flex items-center space-x-3 rounded-md px-4 py-2 hover:bg-zinc-600'
                        onClick={event => {
                          event.stopPropagation()
                          handleClosePopover()
                          onLeaveConversation(conversation)
                        }}
                      >
                        <ArrowLeftOnRectangleIcon className='h-5 w-5 text-red-700' />
                        <span>Leave</span>
                      </button>
                    ) : (
                      <button
                        type='button'
                        className='flex items-center space-x-3 rounded-md px-4 py-2 hover:bg-zinc-600'
                        onClick={event => {
                          event.stopPropagation()
                          handleClosePopover()
                          onDeleteConversation(conversation.id)
                        }}
                      >
                        <TrashIcon className='h-5 w-5 text-red-700' />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                  {/* Additional pop-up content */}
                </Popover.Panel>
              </>
            )}
          </Popover>
        </Transition>
      )}
      <div>
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
      <div className='ml-2 flex h-full w-[80%] items-center justify-between'>
        <div className='flex h-full w-[70%] flex-col'>
          <p className='overflow-hidden overflow-ellipsis whitespace-nowrap text-left font-bold'>
            {formatUsernames(conversation.participants, userId)}
          </p>
          {conversation.latestMessage && (
            <div className='w-[105%]'>
              <p className='overflow-hidden overflow-ellipsis whitespace-nowrap text-left font-thin'>
                {conversation.latestMessage.body}
              </p>
            </div>
          )}
        </div>
        <div>
          <p className='text-right'>
            {formatRelative(conversation.updatedAt, new Date(), {
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
