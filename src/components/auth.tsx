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
    const [incorrectPasswordMessage, setIncorrectPasswordMessage] = useState("");

    //inactive/unverified/suspended account
    const [inactiveAccount, setInactiveAccount] = useState(false);
    const [accountAlert, setAccountAlert] = useState("");

    //firebase functions must use await. 
    const logIn = async (event: React.FormEvent) => {
        event.preventDefault();//Stop page reload

        const auth = getAuth();
        //find document using username 
        const userData = new UserData((await getDocAt("users/" + username)).data())
        //Is this user suspended?
        const time = new Date()
        const isSuspended = time.getTime() >= userData.suspendStartDate.toDate().getTime() && time.getTime() <= userData.suspendEndDate.toDate().getTime() ? true : false;
        console.log("Suspended = " + isSuspended);
        
        //if User is inactive/suspended/unverified, show error. Otherwise, log in. 
        if(!userData.active || isSuspended || !userData.verified) {
            setAccountAlert("Account is unverified, inactive, or suspended. Please contact your administrator.");
            setInactiveAccount(true);
        } else { 
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
    }

    return (
        <div className="wrapper">
            {inactiveAccount &&
                <Alert text = {accountAlert} color = "danger" />
            }
            {remainingAttempts !=2 &&
            <Alert text = {incorrectPasswordMessage} color = "danger" />
            }
            <form onSubmit={logIn}>
                <div>
                    <input placeholder="User..." onChange={(e) => setUserName(e.target.value)} />
                </div>
                <div>
                    <input placeholder="Password..." type="password" onChange={(e) => setPassword(e.target.value)} />
                </div><br></br>
                <div className="btn-group">
                    <button className="btn btn-primary" type="submit"> LogIn </button>
                    <button className="btn btn-secondary" onClick={() => { navigate("newuser"); }}>New User</button>
                </div><br></br>
                <i className="popup-link" onClick={() => setForgotPasswordShown(true)}><u>Forgot password</u></i>
            </form>
            

         <div> 
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