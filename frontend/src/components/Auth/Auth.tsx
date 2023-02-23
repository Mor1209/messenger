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
              className='block w-full rounded-md border-gray-700 bg-transparent text-zinc-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
            />
            <button
              onClick={onSubmit}
              className='w-full rounded-md bg-gray-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-gray-600 focus:z-10'
            >
              Save
            </button>
          </>
        ) : (
          <>
            <p className='text-3xl text-zinc-200'>Messenger</p>
            <button onClick={() => signIn('google')}>
              <div className='inline-flex flex-nowrap items-center gap-2 rounded-md bg-gray-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-gray-600 focus:z-10'>
                <img src='/images/googlelogo.png' className='h-5' />
                Continue with Google
              </div>
            </button>
          </>
        )}
      </div>
    </div>
  )
}
