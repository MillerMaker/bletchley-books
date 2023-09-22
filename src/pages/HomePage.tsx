import React from 'react'
import Message from '../Message'
import { Auth } from '../components/auth'

function HomePage() {
  return (
    <div>
        <Message />
        <Auth />
    </div>
  )
}

export default HomePage