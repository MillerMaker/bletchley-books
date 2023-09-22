import React from 'react'
import Message from '../Message'
import { Auth } from '../components/auth'
import ListGroup from '../components/ListGroup'

function HomePage() {
  return (
    <div>
        <Message />
        <Auth />
        <ListGroup />
    </div>
  )
}

export default HomePage