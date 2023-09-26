import {  UserData, getDocAt, saveDocAt} from '../firebase';
import {Timestamp} from 'firebase/firestore'
import { signInWithEmailAndPassword, getAuth, updateProfile} from 'firebase/auth';
import {useState} from "react";
import { useNavigate} from "react-router-dom";
import Alert from "./Alert";
import '../App.css';
import ForgotPassword from './ForgotPassword';



export const Auth = function() {
    const [username, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [remainingAttempts, setremainingAttempts] = useState(2);
    const navigate = useNavigate();

    //Forgot Password State
    const [forgotPasswordShown, setForgotPasswordShown] = useState(false);
    const [incorrectPasswordShown, setIncorrectPasswordShown] = useState(false);
    const [incorrectPasswordMessage, setIncorrectPasswordMessage] = useState("");


    //firebase functions must use await. 
    const logIn = async () => {
        const auth = getAuth();
        //find document using username 
        const userData = new UserData((await getDocAt("users/" + username)).data())
        console.log(userData.email)

        //query document for email address, and sign in with email. 
        signInWithEmailAndPassword(auth, userData.email, password).then((userCredential) => {
        const user = userCredential.user;
        updateProfile(user, {displayName: username})
        userData.role == "admin"? navigate("/private-outlet/admin") : navigate("/private-outlet/dashboard")
        })
            .catch((error) => {
                console.log(error);
                setremainingAttempts((remainingAttempts-1));
                console.log(remainingAttempts);
                if(remainingAttempts > 0) {
                setIncorrectPasswordMessage("Password is incorrect. you have " + (remainingAttempts) + " attempt(s) remaining");
                } else {
                setIncorrectPasswordMessage("Password is incorrect. Your account has been suspended for 24 hours. Please contact your administrator.");
                
                const today = new Date()
                const tomorrow= new Date
                tomorrow.setHours(24);

                const startDate = Timestamp.fromDate(today);
                const endDate = Timestamp.fromDate(tomorrow)
 
                userData.suspendStartDate = startDate;
                userData.suspendEndDate = endDate;
                saveDocAt("users/"+ username, userData); 
                }
            })
    }

    return (
        <div className = "wrapper">
            {remainingAttempts !=2 &&
            <div>
            <Alert text = {incorrectPasswordMessage} color = "danger" />
            </div>
            }
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