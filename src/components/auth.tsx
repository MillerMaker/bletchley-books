import {  db, getUserDocAt, saveUserDoc} from '../firebase';
import { signInWithEmailAndPassword, getAuth} from 'firebase/auth';
import {useState} from "react";
import {matchPath, useNavigate} from "react-router-dom";
import './auth.css';



export const Auth = function() {
    const [username, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();


    const auth = getAuth();
    //firebase functions must use await. 
    const logIn = async () => {
        //find document using username 
        const userData = (await getUserDocAt( "users", username)).userData;
        //query document for email address, and sign in with email. 
        signInWithEmailAndPassword(auth, userData.email, password).then((userCredential) => {
        const user = userCredential.user;
        userData.role == 'administrator'? navigate("/private-outlet/admin") : navigate("/private-outlet/dashboard")
            })
            .catch((error) => {
                console.log(error.message);
            })
    }

    return (
        <div className = "wrapper">
            <div>
                <input placeholder = "Email..." onChange={(e) => setUserName(e.target.value)}/>
            </div>
            <div>
                <input placeholder = "Password" type = "password" onChange={(e) => setPassword(e.target.value)}/>
            </div>
            <div>
                <button onClick = {logIn}> LogIn </button>
                <button onClick={() => {navigate("newuser");}}>New User</button>
                <div>
                <i><u>Forgot password</u></i>
                </div>
            </div>

         <div> 
          <h6> Sample admin account: </h6> 
          <i>username: 'john@gmail.com' and password: '123456'</i>
        </div>
        </div> 
    )
}