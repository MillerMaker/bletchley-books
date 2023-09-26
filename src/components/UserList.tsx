import { ChangeEvent, Fragment, useEffect, useState } from 'react'
import { Timestamp, collection, getDoc, getDocs, query, where } from 'firebase/firestore';
import { getDocAt, toUserDocArray, UserData, saveDocAt, UserDoc, db } from '../firebase';
import CustomPopup from './CustomPopup';
import SendEmail from '../Email';
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom'
import RolePopup from './RolePopup';
import CreateNewUser from '../pages/CreateNewUser';
import NewUser from './NewUser';
/*

From Users Table
-Email Users
-Suspend any user from a start date to end date
-Change Role
-Activate/Deactivate User

From Admin Home
-Update User Data - Send to Register Page
-Create Users     - Send to Register Page
-Report of Expired Passwords -
-The administrator should have a report where he can view all users in
the system without going straight to the tables (WHAT DOES IT MEAN? Potentially show a list of active usernames + a button to navigate to full table?)
*/


function UserList() {
    const [selectedIndex, setSelectedIndex] = useState(-1);
    //User Docs
    const [userDocs, setUserDocs] = useState(Array<UserDoc>);
    const [requestedData, setRequestedData] = useState(false);

    //Suspend Popup State
    const [suspendPopupShown, setSuspendPopupShown] = useState(false);
    const [suspendStartDate, setSuspendStartDate] = useState(new Timestamp(0, 0));
    const [suspendEndDate, setSuspendEndDate] = useState(new Timestamp(0, 0));
    const [isDateValid, setIsDateValid] = useState(true);
    const timezoneDiffMilli = new Date().getTimezoneOffset() * 60000; //Timezone difference from database in milliseconds

    //Email Popup State
    const [emailPopupShown, setEmailPopupShown] = useState(false);
    const [emailSubjectValue, setEmailSubjectValue] = useState("");
    const [emailTextValue, setEmailTextValue] = useState("");
    const [isEmailValid, setIsEmailValid] = useState(true);

    //Change Rolel Popup State
    const [changeRolePopupShown, setChangeRolePopupShown] = useState(false);

    //Add create user popup
    const [addUserPopupShown, setUserPopupShown] = useState(false);







    async function GetUserData() {
        /* Request User Docs Once */
        if (requestedData) return;
        setRequestedData(true);


        const queryResults = await getDocs(query(collection(db, "users"), where("verified", "==", true)));
        setUserDocs(toUserDocArray(queryResults));
    }
    GetUserData();

    
        




    /* Handle Toggleing User.Active */
    function HandleClickToggleActivate() {
        console.log("Clicked on Toggle Activate!");
        let newUserDocs = [...userDocs];
        newUserDocs[selectedIndex].userData.active = !newUserDocs[selectedIndex].userData.active;
        saveDocAt("users/" + newUserDocs[selectedIndex].username, newUserDocs[selectedIndex].userData);
        setUserDocs(newUserDocs);
    }



    function HandleSubmitSuspension() {
        //If start date > end date --> show date error
        if (suspendStartDate >= suspendEndDate)
            setIsDateValid(false);
        else {
            let newUserDocs = [...userDocs];
            newUserDocs[selectedIndex].userData.suspendStartDate = suspendStartDate;
            newUserDocs[selectedIndex].userData.suspendEndDate   = suspendEndDate;


            saveDocAt("users/" + newUserDocs[selectedIndex].username, newUserDocs[selectedIndex].userData)
            CloseSuspensionPopup();
        }
        
    }
    function ClearSuspension() {
        userDocs[selectedIndex].userData.suspendStartDate = new Timestamp(0,0);
        userDocs[selectedIndex].userData.suspendEndDate   = new Timestamp(0,0);

        saveDocAt("users/" + userDocs[selectedIndex].username, userDocs[selectedIndex].userData)
        CloseSuspensionPopup();
    }
    function CloseSuspensionPopup() {
        setSuspendStartDate(new Timestamp(0, 0));
        setSuspendEndDate(new Timestamp(0,0));
        setIsDateValid(true);
        setSuspendPopupShown(false);
    }
    function GetTimeString(timeSeconds: number): string {
        return new Date(timeSeconds * 1000 + timezoneDiffMilli).toLocaleDateString();
    }
    function TimeStampToDateString(timestamp: Timestamp): string {
        var now = new Date(timestamp.seconds * 1000 + timezoneDiffMilli);

        var day = ("0" + now.getDate()).slice(-2);
        var month = ("0" + (now.getMonth() + 1)).slice(-2);

        var today = now.getFullYear() + "-" + (month) + "-" + (day);

        return today;
    }

    function HandleChangeRole(selectedRole: string) {
        userDocs[selectedIndex].userData.role = selectedRole;
        setUserDocs(userDocs);
        saveDocAt("users/" + userDocs[selectedIndex].username, userDocs[selectedIndex].userData)
        setChangeRolePopupShown(false);
    }

    function HandleEmailRequest() {
        //If Either email field is empty return
        if (emailSubjectValue == "" || emailTextValue == "") {
            setIsEmailValid(false);
            return;
        }

        console.log("Request to send email to: " + userDocs[selectedIndex].userData.email);
        CloseEmailPopup();
        SendEmail( userDocs[selectedIndex].userData.email,emailSubjectValue,emailTextValue)
    }
    function CloseEmailPopup() {
        setIsEmailValid(true);
        setEmailPopupShown(false);
        setEmailSubjectValue("");
        setEmailTextValue("");
    }


    /* RETURN HTML */
    return (
        <>
            <h1>All Users</h1>
            <button
                className="btn-block btn btn-success long" onClick = {() => setUserPopupShown(true)}
            >
                Create User
            </button>
            <br></br><br></br>
            {userDocs.length == 0 && <p>No Users Found</p>}
            <table className="table table-bordered table-hover">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>First</th>
                        <th>Last</th>
                        <th>Address</th>
                        <th>DOB</th>
                        <th>DOC</th>
                        <th>Role</th>
                        <th>Active</th>
                        <th>Suspension Period</th>
                    </tr>
                </thead>
                <tbody>
                    {userDocs.map((userDoc: UserDoc, index: number) =>
                        <tr
                            className={"" + (selectedIndex == index && "table-primary")}
                            key={userDoc.username}
                            onClick={() => setSelectedIndex(index)}>
                            <td>{userDoc.username}</td>
                            <td>{userDoc.userData.email}</td>
                            <td>{userDoc.userData.first}</td>
                            <td>{userDoc.userData.last}</td>
                            <td>{userDoc.userData.address}</td>
                            <td>{GetTimeString(userDoc.userData.dob.seconds)}</td>
                            <td>{GetTimeString(userDoc.userData.doc.seconds)}</td>
                            <td>{userDoc.userData.role}</td>
                            <td className={(userDoc.userData.active as boolean ? "table-success" : "table-danger")}>{userDoc.userData.active.toString()}</td>
                            <td>
                                {userDoc.userData.suspendStartDate == undefined ? "" : GetTimeString(userDoc.userData.suspendStartDate.seconds)}
                                -
                                {userDoc.userData.suspendEndDate == undefined ? "" : GetTimeString(userDoc.userData.suspendEndDate.seconds)}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            {userDocs.length != 0 && selectedIndex != -1 && // USER BUTTONS  Only Display Buttons if a User is Selected AND there are users Loaded
                <div className="btn-group">
                    <button
                        className={"btn" + (userDocs[selectedIndex].userData.active ? " btn-danger" : " btn-success")}
                        onClick={(choice) => HandleClickToggleActivate()}
                    >
                        {userDocs[selectedIndex].userData.active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => console.log("EDIT PRESSED")}
                    >
                        Edit
                    </button>
                        <button
                            className="btn btn-secondary"
                            onClick={() => {setChangeRolePopupShown(true); console.log("CHANGE ROLE PRESSED");}}
                        >
                            Change Role
                        </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => setEmailPopupShown(true)}
                    >
                        Email
                    </button>
                    <button
                        className="btn btn-warning"
                        onClick={() => setSuspendPopupShown(true)}
                    >
                        Suspend
                    </button>
                </div>
            }
            {suspendPopupShown && //Show Suspend Popup if Suspend Popup Shown
                <CustomPopup child={
                    <><h3>Enter Suspension Period</h3>
                        <br></br>
                    <input
                        value={TimeStampToDateString(suspendStartDate)}
                        onChange={(e) => { setSuspendStartDate(new Timestamp(e.target.valueAsNumber / 1000, 0)); }}
                            type="date">
                        </input>
                    <input
                        value={TimeStampToDateString(suspendEndDate)}
                            onChange={(e) => setSuspendEndDate(new Timestamp(e.target.valueAsNumber/1000, 0))}
                            type="date">
                        </input>
                        <br></br><br></br><br></br>
                        <div className="btn-group">
                            <button
                                onClick={HandleSubmitSuspension}
                                className="btn btn-primary">
                                Submit
                            </button>
                            <button
                                onClick={() => ClearSuspension()}
                                className="btn btn-secondary">
                                Clear Suspension
                            </button>
                            <button
                                onClick={() => CloseSuspensionPopup()}
                                className="btn btn-secondary">
                                Back
                            </button>
                        </div>
                        <br></br><br></br>
                    {!isDateValid && < p className="red-text">Please input a valid set of dates</p>} </>
                } />
            }
            {emailPopupShown && //Show Email Popup if Email Popup Shown
                <CustomPopup child={<>
                    <h3>Enter Email</h3>
                    <form>
                    <div className="form-group">
                        <input
                            placeholder="Subject..."
                            className="form-control"
                            value={emailSubjectValue}
                            onChange={(e) => setEmailSubjectValue(e.target.value)}
                        >
                        </input>
                            <textarea
                                value={emailTextValue}
                                onChange={(event) => setEmailTextValue(event.target.value)}
                                className="form-control no-resize" rows={3}
                                placeholder="Email body..."
                            >
                            </textarea>
                        </div>
                    </form>
                    <br></br>
                    <div className="btn-group">
                    <button
                        onClick={HandleEmailRequest}
                            className="btn btn-primary">
                            Send
                        </button>
                    <button
                        onClick={CloseEmailPopup}
                            className="btn btn-secondary">
                            Back
                        </button>
                    </div>
                <br></br>
                {!isEmailValid && //Show warning if date is invalid
                        <p className="red-text">Please input subject and body</p>
                } </>} />
            }
            {changeRolePopupShown && //Show Change Role Popup if Change Role Popup Shown
                <RolePopup popupText="Change User Role" roleChosenCallback={HandleChangeRole} backPressedCallback={() => setChangeRolePopupShown(false)} />
            }


            {addUserPopupShown && //Show Suspend Popup if Suspend Popup Shown
                <CustomPopup child={
                    <>
                   <NewUser atAdmin = {true}/>
                   <button onClick={() => setUserPopupShown(false)}
                    className="btn btn-primary"
                    >
                        Close
                   </button>
                   </>
                } />
            }

{addUserPopupShown && //Show Suspend Popup if Suspend Popup Shown
                <CustomPopup child={
                    <>
                   <NewUser atAdmin = {true}/>
                   <button onClick={() => setUserPopupShown(false)}
                    className="btn btn-primary"
                    >
                        Close
                   </button>
                   </>
                } />
            }
        </>
    );
}

export default UserList;