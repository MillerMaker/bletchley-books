import { useState } from "react";
import CustomPopup from "./CustomPopup";
import { UserData, auth, getDocAt } from "../firebase";
import { sendPasswordResetEmail } from "@firebase/auth";


interface Props {
    resetCallback: () => void
    backCallback: () => void
}


function ForgotPassword(props: Props) {
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        a1: '',
        a2: '',
        a3: '',
    });


    const handleChange = (e: { target: { name: any; value: any; }; }) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };


    async function HandleReset() {
        //Catch bad submissions
        if (formData.email == "" || formData.username == "" || formData.a1 == "" || formData.a2 == "" || formData.a3 == "" || submitted) return;



        //Only one submission
        setSubmitted(true); 


        //Get User data send email to said user
        try {
            const userData = new UserData((await getDocAt("users/" + formData.username)).data());

            //Catch incorrect Security Questions
            if (formData.a1.toUpperCase() != userData.securityQuestions[0].toUpperCase() || formData.a2.toUpperCase() != userData.securityQuestions[1].toUpperCase() || formData.a3.toUpperCase() != userData.securityQuestions[2].toUpperCase()) {
                console.log("Incorrect Security Questions");
                console.log(formData.a1 +"  "+ userData.securityQuestions[0].toUpperCase())
            }
            else {
                console.log("Sending Email to " + formData.email);
                sendPasswordResetEmail(auth, formData.email).then(() => console.log("Password Reset Email Sent!")).catch((error) => console.log("Email failed: " + error.message));
            }
        }
        catch {
            console.log("Password reset for: " + formData.username + " Failed!");
            setSubmitted(false);
        }

        props.resetCallback();
    }


    return <CustomPopup child={
        <>
            <h4>Forgot Password</h4>
            <form>
                <span>Email: </span>
                <input id="email" name="email" value={formData.email} onChange={handleChange}/><br></br>
                <span>Username: </span>
                <input id="username" name="username" value={formData.username} onChange={handleChange} /><br></br>
                <span>Name of your first pet: </span>
                <input id="a1" name="a1" value={formData.a1} onChange={handleChange} /><br></br>
                <span>Elementary School: </span>
                <input id="a2" name="a2" value={formData.a2} onChange={handleChange} /><br></br>
                <span>Mother's maiden name: </span>
                <input id="a3" name="a3" value={formData.a3} onChange={handleChange} /><br></br><br></br>
            </form>
            <div className="btn-group">
                <button
                    onClick={HandleReset}
                    className="btn btn-primary"
                >
                    Reset
                </button>
                <button
                    onClick={props.backCallback}
                    className="btn btn-secondary">
                    Back
                </button>
            </div>
        </>
    } />
}


export default ForgotPassword;