import React from 'react'
import { Auth } from '../components/auth'
import Header from '../components/Header'
import { getAuth, isSignInWithEmailLink, signInWithEmailLink } from '@firebase/auth';

function HomePage() {


  return (
      <div>
        <Header homePath={""} title={"Login"} />
        <Auth />
    </div> 
  )
}

export default HomePage