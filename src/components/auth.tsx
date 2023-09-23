import { auth } from '../firebase';
import { EmailAuthCredential, signInWithEmailAndPassword} from 'firebase/auth';
import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {getDocs, collection} from "firebase/firestore"
import Alert from './Alert';

export const Auth = function() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();


    //firebase functions must use await. 
    const logIn = async () => {
        await signInWithEmailAndPassword(auth, email, password).then(() => {
            navigate("Dashboard");
        })
        .catch((error) => {

            const errorCode = error.code;
            const errorMessage = error.message;
        });

    }

    return (
        <div>
            <div>
                <input placeholder = "Email..." onChange={(e) => setEmail(e.target.value)}/>
            </div>
            <div>
                <input placeholder = "Password" type = "password" onChange={(e) => setPassword(e.target.value)}/>
            </div>
            <div>
                <button onClick = {logIn}> LogIn </button>
                <button onClick={() => {navigate("newuser");}}>New User</button>
            </div>
        </div> 
    )
}