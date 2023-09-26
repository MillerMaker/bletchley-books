import {useState} from "react"
import Header from '../components/Header'
import { UserDoc, toUserDocArray, db } from "../firebase";
import { collection, deleteDoc, doc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import CustomPopup from "../components/CustomPopup";
import SendEmail from '../Email';

function AdminPasswordPage() {
    
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [userDocs, setUserDocs] = useState(Array<UserDoc>);
    const [requestedData, setRequestedData] = useState(false);
    const [showUserNotifiedPopup, setShowUserNotifiedPopup] = useState(false);
    const timezoneDiffMilli = new Date().getTimezoneOffset() * 60000;

    
    function GetTimeString(timeSeconds: number): string {
        return new Date(timeSeconds * 1000 + timezoneDiffMilli).toLocaleDateString();
    }

    async function UpdateUserDocs() {
        const queryResults = await getDocs(query(collection(db, "users"), where("verified", "==", true)));
        setUserDocs(toUserDocArray(queryResults));
    }
    
    if (!requestedData) {
        setRequestedData(true);
        UpdateUserDocs();
    }

    function onNotify() {
        SendEmail(
            userDocs[selectedIndex].userData.email,
            "Bletchley Books Password Expiration",
            "Hello, " + userDocs[selectedIndex].userData.first + " " + userDocs[selectedIndex].userData.last + "!" +
            "Your password for Bletchley Books is about to expire. Please navigate to our site and click 'Forgot Password' to reset before it expires. Thank you!"
        );
        setShowUserNotifiedPopup(true);
    }

    return (
        <>
            <Header title="Password Report" homePath="/private-outlet/admin" />
            {userDocs.length == 0 && <p>No Users Found</p>}
            <table className="table table-bordered table-hover">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>First</th>
                        <th>Last</th>
                        <th>Password Expiration</th>
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
                            <td>{userDoc.userData.passwordExpiration == undefined ? "" : GetTimeString(userDoc.userData.passwordExpiration.seconds)}</td>
                        </tr>
                    )}
                </tbody>
            </table>
            {userDocs.length != 0 && selectedIndex != -1 &&
                <div className="btn-group">
                    <button
                        className="btn-danger"
                        onClick={(choice) => onNotify()}
                    >
                        Notify
                    </button>
                </div>
            }
            {showUserNotifiedPopup && <CustomPopup child = {
                <>
                    <h4>Email sent to {userDocs[selectedIndex].userData.first} {userDocs[selectedIndex].userData.last}!</h4>
                    <button onClick={() => setShowUserNotifiedPopup(false)}>Okay</button>
                </>
            }/>}
        </>
    )

}

export default AdminPasswordPage