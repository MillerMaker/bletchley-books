import { auth, db, getUserDocAt, saveUserDoc} from '../firebase';
import {doc, getDoc} from "firebase/firestore";
import { signInWithEmailAndPassword} from 'firebase/auth';
import {useState} from "react";
import {useNavigate} from "react-router-dom";
import bcrypt from "bcryptjs-react";
import Alert from './Alert';


export const Auth = function() {
    const [username, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();



    //firebase functions must use await. 
    const logIn = async () => {

        //find document using username 
        const userData = (await getUserDocAt( "users", username)).userData;
        //query document for email address, and sign in with email. 
        bcrypt.compare(password, userData.password, function(err, res) {
            if(res) {
            userData.role == 'administrator'? navigate("adminpage") : navigate("dashboard")
             } else {
            console.log("Incorrect password")
            } 
        }
        );
        //console.log(userData)
    }

    return (
        <div>
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