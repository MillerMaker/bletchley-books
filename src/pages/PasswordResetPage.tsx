import React, { Fragment, useState } from 'react'
import { Auth } from '../components/auth'
import Header from '../components/Header'
import Alert from '../components/Alert';
import PasswordChecklist from "react-password-checklist"
import { HashString, UserData, UserDoc, auth, db, saveDocAt } from '../firebase';
import { updatePassword } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import bcrypt from "bcryptjs-react";

function PasswordChangePage() {
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [isValid, setIsValid] = useState(false);
    const [alertShown, setAlertShown] = useState(false);
    const [alertText, setAlertText] = useState("");

    //Handles actually resetting the password
    async function ChangePassword(e: React.FormEvent, changeSuccessCallback: () => void) {
        e.preventDefault();

        if (submitted) return;  //Prevent double 
        setSubmitted(true);      //  submission
        setAlertShown(false);


        //Change Password
        const currentUser = auth.currentUser;
        if (currentUser != null) {
            //Get User Doc for this Email
            const queryResults = await getDocs(query(collection(db, "users"), where("email", "==", currentUser.email)));
            const currentUserDoc = new UserDoc(queryResults.docs[0].id, queryResults.docs[0].data());


            //Add password to Old Passwords
            if (currentUserDoc.userData.oldPasswords == null) currentUserDoc.userData.oldPasswords = []; //Null check
            currentUserDoc.userData.oldPasswords.push(currentUserDoc.userData.password);

            //Hash new Password
            const newPasswordHashed = await HashString(newPassword);

            //Ensure no password reuse
            for (let i = 0; i < currentUserDoc.userData.oldPasswords.length; i++) {
                const match = await bcrypt.compare(newPassword, currentUserDoc.userData.oldPasswords[i])
                if (!match) continue;

                //Password is an old Password
                setAlertShown(true);
                setAlertText("New password cannot be one of your old passwords!");
                setSubmitted(false);
                return;
            }



            //Save Changes to password fields
            saveDocAt("users/" + currentUserDoc.username, { password: newPasswordHashed, oldPasswords: currentUserDoc.userData.oldPasswords }); //Database
            updatePassword(currentUser, newPassword); //Auth

            console.log("Password Updated");

            changeSuccessCallback();
        }
        else { //No user login reload page
            console.log("No user Auth");
            window.location.replace("/");
        }
    }


    return (
        <>
            <Header homePath={"/private-outlet/dashboard"} title={"Reset Password"} />
            {alertShown && <Alert text={alertText} color={"danger"}></Alert>}
            <form onSubmit={(e: React.FormEvent) => { ChangePassword(e, () => { navigate("/") }) }}>
                <span>Password: </span>
                <input
                    placeholder="New Password..."
                    type="password"
                    id="password"
                    name="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />
                <div className="password-check">
                    {!isValid && <Alert text="Please enter a valid password" color='danger' />}
                    <PasswordChecklist
                        rules={["minLength", "specialChar", "number", "capital"]}
                        minLength={8}
                        value={newPassword}
                        onChange={setIsValid}
                    />
                </div>
                <button type="submit" className="btn btn-primary">
                    Change Password
                </button>
            </form>
        </>
    )
}

export default PasswordChangePage