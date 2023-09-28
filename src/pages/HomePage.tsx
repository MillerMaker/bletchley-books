import React from 'react'
import { Auth } from '../components/auth'
import Header from '../components/Header'
import { getAuth, isSignInWithEmailLink, signInWithEmailLink } from '@firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

function HomePage() {

    //HANDLES EMAIL SIGNIN//
    // Confirm the link is a sign-in with email link.
    const navigate = useNavigate();
    if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
            email = window.prompt('Please provide your email for confirmation');
        }
        if (email)
        signInWithEmailLink(auth, email, window.location.href)
            .then((result) => {
                // Clear email from storage.
                window.localStorage.removeItem('emailForSignIn');
                navigate("private-outlet/password-change");
            })
            .catch((error) => {
                // Some error occurred, you can inspect the code: error.code
                // Common errors could be invalid email and invalid or expired OTPs.
                console.log("Email signin failed: " + error);
            });
    }


  return (
      <div>
        <Header homePath={""} title={"Login"} />
        <Auth />
    </div> 
  )
}

export default HomePage