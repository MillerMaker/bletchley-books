import { useState } from "react";
import CustomPopup from "./CustomPopup";
import { UserData, auth, getDocAt } from "../firebase";
import Alert from "./Alert";
import PasswordChecklist from "react-password-checklist"
import { sendSignInLinkToEmail } from "@firebase/auth";


interface Props {
    resetCallback: () => void
    backCallback: () => void
}


function ForgotPassword(props: Props) {
    //Reset Fields
    const handleChange = (e: { target: { name: any; value: any; }; }) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        a1: '',
        a2: '',
        a3: '',
        password: ''
    });


    //Password Field
    const [passedSecurityQuestions, setPassedSecurityQuestions] = useState(false);
    const [currentPass, setCurrentPass] = useState("");
    const [isValid, setIsValid] = useState(false);




    //Handles  requests for a password reset
    //  Confirms user details entered are accurate
    //  & confirms security question answers are correct
    //  then shows reset password popup
    async function HandleResetRequest() {
        //Catch bad submissions
        if (formData.email == "" || formData.username == "" || formData.a1 == "" || formData.a2 == "" || formData.a3 == "" || submitted) return;


        //Get User data send email to said user
        try {
            const userData = new UserData((await getDocAt("users/" + formData.username)).data());

            //Catch incorrect Security Questions
            if (formData.a1.toUpperCase() != userData.securityQuestions[0].toUpperCase() || formData.a2.toUpperCase() != userData.securityQuestions[1].toUpperCase() || formData.a3.toUpperCase() != userData.securityQuestions[2].toUpperCase()) {
                console.log("Incorrect Security Questions");
            }
            else {
                console.log("Correct Security Questions: Showing reset Password");
                setPassedSecurityQuestions(true);
            }
        }
        catch {
            console.log("Password reset for: " + formData.username + " Failed!");
            setSubmitted(false);
        }

        sendSignInLinkToEmail(auth, formData.email, { url: "http://localhost:5173/", handleCodeInApp: true });
    }


    //Handles actually resetting the password
    async function HandleReset() {
        //Only one submission
        setSubmitted(true);

        


        

        props.resetCallback();
    }



    return <CustomPopup child={
        <>
            <h4>Forgot Password</h4>
            { !passedSecurityQuestions && //Show Security Questions if you havent passed them
            <>
                <form>
                    <span>Email: </span>
                    <input id="email" name="email" value={formData.email} onChange={handleChange} /><br></br>
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
                        onClick={HandleResetRequest}
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
            </>}
            {passedSecurityQuestions && //Show password Reset Prompt
                <>
                        <label htmlFor="Password">Password</label>
                        <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        /> 
                        <div className = "password-check">
                        {!isValid && <Alert text = "Please enter a valid password" color = 'danger'/>}
                            <PasswordChecklist
                            rules={["minLength","specialChar","number","capital"]}
                            minLength={8}
                            value={formData.password}
                            onChange={setIsValid}
                         />
                        </div>
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
                </>}
        </>

    } />
}


export default ForgotPassword;