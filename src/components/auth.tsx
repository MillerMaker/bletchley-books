import { auth } from '../firebase';
import { EmailAuthCredential, createUserWithEmailAndPassword} from 'firebase/auth';
import {useState} from "react";
import {useNavigate} from "react-router-dom";

export const Auth = function() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const signIn = async () => {
        await createUserWithEmailAndPassword(auth, email, password);
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
                <button onClick = {signIn}> Sign In </button>
                <button onClick={() => {navigate("newuser");}}>New User</button>
            </div>
        </div> 
    )
}