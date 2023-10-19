import Header from '../components/Header'
import { useState } from 'react';
import { collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import RolePopup from '../components/RolePopup';
import ConfirmPopup from '../components/ConfirmPopup';
import { UserDoc, db, deleteDocAt, saveDocAt, toUserDocArray } from '../firebase';
import SendEmail from '../Email';


function AdminVerificationPage() {
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [userDocs, setUserDocs] = useState(Array<UserDoc>);
    const [requestedData, setRequestedData] = useState(false);

    //Show Popup State
    const [showRoleSelection, setShowRoleSelection] = useState(false);
    const [showRejectConfirmation, setShowRejectConfirmation] = useState(false);



    //Retrieve user data of unverified users
    async function UpdateUserDocs() {
        const queryResults = await getDocs(query(collection(db, "users"), where("verified", "==", false)));
        setUserDocs(toUserDocArray(queryResults));
    }
    /* Request User Docs Once */
    if (!requestedData) {
        setRequestedData(true);
        UpdateUserDocs();
    }
        



    async function HandleAccept(newRole: string) {
        const newUserDoc = new UserDoc(userDocs[selectedIndex].username, userDocs[selectedIndex].userData);
        newUserDoc.userData.role = newRole;
        newUserDoc.userData.verified = true;

        SendEmail(newUserDoc.userData.email, "Account Verified", "Your account has been verified!\n Your username is: " + newUserDoc.username + "\n\n please login at: http://localhost:5173/");
        saveDocAt("users/" + newUserDoc.username, newUserDoc.userData);
        setShowRoleSelection(false);
        UpdateUserDocs();
    }
    async function HandleReject() {
        await deleteDocAt("users/" + userDocs[selectedIndex].username);
        UpdateUserDocs();
    }

    return (
        <>
            <Header title="User Verification" homePath="/private-outlet/admin" />
            {userDocs.length == 0 && <h1>No Users to Verify</h1>}
            <table className="table table-bordered table-hover">
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>First</th>
                        <th>Last</th>
                        <th>Address</th>
                    </tr>
                </thead>
                <tbody>
                    {userDocs.map((userDoc: UserDoc, index: number) =>
                        <tr
                            className={"" + (selectedIndex == index && "table-primary")}
                            key={userDoc.username}
                            onClick={() => setSelectedIndex(index)}>
                            <td>{userDoc.userData.email}</td>
                            <td>{userDoc.userData.first}</td>
                            <td>{userDoc.userData.last}</td>
                            <td>{userDoc.userData.address}</td>
                        </tr>
                    )}
                </tbody>
            </table>
            <div className="btn-group">
                <button title="Accept new user"
                    className={"btn btn-success" + (userDocs.length == 0 ? " disabled" : "")}
                    onClick={() => setShowRoleSelection(true)}
                >
                    ACCEPT
                </button>
                <button title="Reject new user"
                    className={"btn btn-danger" + (userDocs.length == 0 ? " disabled" : "")}
                    onClick={HandleReject}
                >
                    REJECT
                </button>

                {showRoleSelection && <RolePopup popupText="Set User Role" backPressedCallback={() => setShowRoleSelection(false)} roleChosenCallback={HandleAccept} />}
                {showRejectConfirmation && <ConfirmPopup backCallback={() => setShowRejectConfirmation(false)} confirmCallback={HandleReject} title="Reject this user?" />}
            </div>
        </>
    )

}

export default AdminVerificationPage