import React, { useState } from "react";
import CustomPopup from "./CustomPopup";
import { UserData, auth, getDocAt } from "../firebase";
import Alert from "./Alert";
import { sendSignInLinkToEmail } from "@firebase/auth";
import { sendEmails } from "../Email";


interface Props {
    resetCallback: () => void
    backCallback: () => void
}


function ForgotPassword(props: Props) {
    const [alertShown, setAlertShown] = useState(false);
    const [alertText, setAlertText] = useState("");
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        a1: '',
        a2: '',
        a3: '',
        password: ''
    });



    //Reset Fields
    const handleChange = (e: { target: { name: any; value: any; }; }) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };


    //Handles  requests for a password reset
    //  Confirms user details entered are accurate
    //  & confirms security question answers are correct
    //  then shows reset password popup
    async function HandleResetRequest(e: React.FormEvent) {
        e.preventDefault();

        //Catch bad submissions
        if (success) return;
        setAlertShown(false);
        //if (formData.email == "" || formData.username == "" || formData.a1 == "" || formData.a2 == "" || formData.a3 == "") { setAlertShown(true); setAlertText("Please"); return; }


        //Get User data send email to said user
        try {
            const userData = new UserData((await getDocAt("users/" + formData.username)).data());

            //Catch incorrect Security Questions
            if (formData.a1.toUpperCase() != userData.securityQuestions[0].toUpperCase() ||
                formData.a2.toUpperCase() != userData.securityQuestions[1].toUpperCase() ||
                formData.a3.toUpperCase() != userData.securityQuestions[2].toUpperCase() ||
                formData.email != userData.email) {
                setAlertShown(true);
                setAlertText("Incorrect email and username or security questions");
            }
            else {
                setSuccess(true);
                setAlertShown(true);
                setAlertText("Sending login link to: " + userData.email + "!");

                if (!sendEmails) return; //Only send Emails if they are enabled in Email.ts
                sendSignInLinkToEmail(auth, formData.email, { url: "http://localhost:5173/", handleCodeInApp: true });
                window.localStorage.setItem('emailForSignIn', formData.email);
            }
        }
        catch {
            console.log("Password reset for: " + formData.username + " Failed!");
            setAlertShown(true);
            setAlertText("Retrieval Failed!");
        }

    }




    return <CustomPopup child={
        <>
            {alertShown && < Alert text={alertText} color={success ? "success" : "danger"}></Alert>}
            <h4>Forgot Password</h4>
            <form onSubmit={HandleResetRequest}>
                <span >Email: </span>
                <input required id="email" name="email" value={formData.email} onChange={handleChange} /><br></br>
                <span>Username: </span>
                <input required id="username" name="username" value={formData.username} onChange={handleChange} /><br></br>
                <span>Name of your first pet: </span>
                <input required id="a1" name="a1" value={formData.a1} onChange={handleChange} /><br></br>
                <span>Elementary School: </span>
                <input required id="a2" name="a2" value={formData.a2} onChange={handleChange} /><br></br>
                <span>Mother's maiden name: </span>
                <input required id="a3" name="a3" value={formData.a3} onChange={handleChange} /><br></br><br></br>
                <div className="btn-group">
                    <button title="Reset your password"
                        type="submit"
                        className="btn btn-primary"
                    >
                        Reset
                    </button>
                    <button title="Go back"
                        onClick={props.backCallback}
                        className="btn btn-secondary">
                        Back
                    </button>
                </div>
            </form>
            
        </>

    } />
}


export default ForgotPassword;