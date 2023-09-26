import {  UserData, getDocAt} from '../firebase';
import { signInWithEmailAndPassword, getAuth, updateProfile} from 'firebase/auth';
import {useState} from "react";
import {matchPath, useNavigate} from "react-router-dom";
import '../App.css';
import ForgotPassword from './ForgotPassword';



export const Auth = function() {
    const [username, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    //Forgot Password State
    const [forgotPasswordShown, setForgotPasswordShown] = useState(false);


    const auth = getAuth();
    //firebase functions must use await. 
    const logIn = async () => {
        //find document using username 
        const userData = new UserData((await getDocAt("users/" + username)).data());

        //query document for email address, and sign in with email. 
        signInWithEmailAndPassword(auth, userData.email, password).then((userCredential) => {
        const user = userCredential.user;
        updateProfile(user, {
            displayName: username
        })
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
                    <i className="popup-link" onClick={() => setForgotPasswordShown(true)}><u>Forgot password</u></i>
                </div>
            </div>

         <div> 
          <h6> Sample admin account: </h6> 
          <i>username: 'john@gmail.com' and password: '123456'</i>
        </div>

            {forgotPasswordShown && //Show forgot password Popup
                <ForgotPassword
                    backCallback={() => setForgotPasswordShown(false)}
                    resetCallback={() => setForgotPasswordShown(false)}
                />
            }
        </div> 
    )
}