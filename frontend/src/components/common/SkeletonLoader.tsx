import React from 'react'

type Props = {
  count: number
  height: string
  // width?: string
}

export default function SkeletonLoader({ count, height }: Props) {
  return (
    <>
      {[...Array(count)].map((_, index) => (
        <div
          key={index}
          className={`flex ${height} w-full animate-pulse rounded-md bg-gray-600`}
        ></div>
      ))}
    </>
  )
}
