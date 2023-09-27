import React, { Fragment, useState } from 'react'
import { Auth } from '../components/auth'
import Header from '../components/Header'
import Alert from '../components/Alert';
import PasswordChecklist from "react-password-checklist"
import { HashString, auth, db, saveDocAt } from '../firebase';
import { updatePassword } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';

function PasswordChangePage() {
    const [newPassword, setNewPassword] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [isValid, setIsValid] = useState(false);


    //Handles actually resetting the password
    async function ChangePassword(e: React.FormEvent) {
        e.preventDefault();

        if (submitted) return;  //Prevent double 
        setSubmitted(true);      //  submission


        //Change Password
        const currentUser = auth.currentUser;
        if (currentUser != null) {
            updatePassword(currentUser, newPassword);

            const queryResults = await getDocs(query(collection(db, "users"), where("email", "==", currentUser.email)));

            const hashedPassword = await HashString(newPassword);
            saveDocAt("users/" + queryResults.docs[0].id, { password: hashedPassword });

            console.log("Password Updated");
        }
        else
            console.log("No user logged in");
    }


    return (
        <>
            <Header homePath={"/"} title={"Reset Password"} />
            <form onSubmit={ChangePassword}>
                <label htmlFor="Password">Password</label>
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