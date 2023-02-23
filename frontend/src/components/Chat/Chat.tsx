import { signOut } from 'next-auth/react'
import React from 'react'

type Props = {}

export default function Chat({}: Props) {
  return (
    <div>
      Chat<button onClick={() => signOut()}>Logout</button>
    </div>
  )
}
