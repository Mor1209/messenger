import { CreateUsernameData, CreateUsernameVariables } from '@/src/util/types'
import { useMutation } from '@apollo/client'
import { Session } from 'next-auth'
import { signIn } from 'next-auth/react'
import React, { useState } from 'react'
import UserOperations from '../../graphql/operations/user'
import toast from 'react-hot-toast'

type Props = {
  session: Session | null
  reloadSession: () => void
}

export default function Auth({ session, reloadSession }: Props) {
  const [username, setUsername] = useState('')

  const [createUsername, { loading, error }] = useMutation<
    CreateUsernameData,
    CreateUsernameVariables
  >(UserOperations.Mutations.createUsername)

  const onSubmit = async () => {
    if (!username) return

    try {
      const { data } = await createUsername({ variables: { username } })

      if (!data?.createUsername) {
        throw new Error()
      }

      if (data.createUsername.error) {
        const {
          createUsername: { error },
        } = data

        throw new Error(error)
      }

      toast.success('Username successfully created! 🚀')
      reloadSession()
    } catch (error: any) {
      toast.error(error?.message)
      console.log('onSubmit error', error)
    }
  }

  return (
    <div className='flex h-screen items-center justify-center'>
      <div className='flex flex-col items-center justify-center gap-5'>
        {session ? (
          <>
            <p className='text-3xl text-zinc-200'>Create a Username</p>
            <label htmlFor='username' className='sr-only'>
              Username
            </label>
            <input
              name='username'
              id='username'
              type='text'
              placeholder='Enter a username'
              value={username}
              onChange={e => setUsername(e.target.value)}
              disabled={loading}
              className='block w-full rounded-md border-gray-700 bg-transparent text-zinc-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
            />
            <button
              onClick={onSubmit}
              className='h-9 w-full rounded-md bg-gray-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-75 disabled:hover:bg-gray-700'
              disabled={loading}
            >
              {loading ? (
                <div role='status'>
                  <svg
                    aria-hidden='true'
                    className='mb-1 inline h-5 w-5 animate-spin fill-zinc-200 text-transparent'
                    viewBox='0 0 100 101'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
                      fill='currentColor'
                    />
                    <path
                      d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
                      fill='currentFill'
                    />
                  </svg>
                  <span className='sr-only'>Loading...</span>
                </div>
              ) : (
                <>Save</>
              )}
            </button>
          </>
        ) : (
          <>
            <p className='text-3xl text-zinc-200'>Messenger</p>
            <div className='flex flex-col gap-3'>
              <button onClick={() => signIn('google')}>
                <div className='inline-flex w-[15rem] flex-nowrap items-center gap-2 rounded-md bg-gray-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-gray-600 focus:z-10'>
                  <img src='/images/googlelogo.png' className='h-5' />
                  Continue with Google
                </div>
              </button>
              <button onClick={() => signIn()}>
                <div className='inline-flex w-[15rem] flex-nowrap items-center gap-2 rounded-md bg-gray-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-gray-600 focus:z-10'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='h-5 w-5'
                  >
                    <path
                      strokeLinecap='round'
                      d='M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 10-2.636 6.364M16.5 12V8.25'
                    />
                  </svg>
                  Continue with an Email
                </div>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
