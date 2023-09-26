import React from 'react'
import { Auth } from '../components/auth'
import Header from '../components/Header'

function HomePage() {
  return (
      <div>
        <Header homePath={""} title={"Login"} />
        <Auth />
    </div> 
  )
}

export default HomePage