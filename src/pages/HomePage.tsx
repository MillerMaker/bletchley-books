import React from 'react'
import { Auth } from '../components/auth'
import Header from '../components/Header'
import { getAuth, isSignInWithEmailLink, signInWithEmailLink } from '@firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

function HomePage() {

    // Confirm the link is a sign-in with email link.
    const navigate = useNavigate();
    if (isSignInWithEmailLink(auth, window.location.href)) {
        // Additional state parameters can also be passed via URL.
        // This can be used to continue the user's intended action before triggering
        // the sign-in operation.
        // Get the email if available. This should be available if the user completes
        // the flow on the same device where they started it.
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
            // User opened the link on a different device. To prevent session fixation
            // attacks, ask the user to provide the associated email again. For example:
            email = window.prompt('Please provide your email for confirmation');
        }


        if (email)
        signInWithEmailLink(auth, email, window.location.href)
            .then((result) => {
                // Clear email from storage.
                window.localStorage.removeItem('emailForSignIn');
                navigate("private-outlet/password-reset");
                // You can access the new user via result.user
                // Additional user info profile not available via:
                // result.additionalUserInfo.profile == null
                // You can check if the user is new or existing:
                // result.additionalUserInfo.isNewUser
            })
            .catch((error) => {
                // Some error occurred, you can inspect the code: error.code
                // Common errors could be invalid email and invalid or expired OTPs.
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