import type { NextPage, NextPageContext } from 'next'
import { getSession, useSession } from 'next-auth/react'
import Auth from '../components/Auth/Auth'
import Chat from '../components/Chat/Chat'

const Home: NextPage = () => {
  const { data: session } = useSession()

  console.log('The data', session)

  const reloadSession = () => {
    const event = new Event('visibilitychange')
    document.dispatchEvent(event)
  }

  return (
    <div className='h-max bg-gray-900 text-zinc-200'>
      {session?.user?.username ? (
        <Chat session={session} />
      ) : (
        <Auth session={session} reloadSession={reloadSession} />
      )}
    </div>
  )
}

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context)

  return {
    props: {
      session,
    },
  }
}

export default Home
