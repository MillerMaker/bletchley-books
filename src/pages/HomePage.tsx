import React from 'react'
import Message from '../Message'
import { Auth } from '../components/auth'
import Header from '../components/Header'

function HomePage() {
  return (
      <div>
        <Header homePath={""} title={"Login"} />
        <Message />
        <Auth />
    </div> 
  )
}

export default HomePage