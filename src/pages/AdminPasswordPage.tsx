import {useState} from "react"
import Header from '../components/Header'
import { UserDoc, toUserDocArray, db, TimeStampToDateString } from "../firebase";
import { collection, getDocs, query, where} from 'firebase/firestore';
import CustomPopup from "../components/CustomPopup";
import SendEmail from '../Email';

function AdminPasswordPage() {
    
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [userDocs, setUserDocs] = useState(Array<UserDoc>);
    const [requestedData, setRequestedData] = useState(false);
    const [showUserNotifiedPopup, setShowUserNotifiedPopup] = useState(false);


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
                        <th>Password Expiring On</th>
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
                            <td className={Date.now()/1000 > userDoc.userData.passwordExpiration.seconds ? "table-danger" : "table-success"}>
                                {userDoc.userData.passwordExpiration == undefined ? "" : TimeStampToDateString(userDoc.userData.passwordExpiration)}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            {userDocs.length != 0 && selectedIndex != -1 &&
                    <button title="Notify user of their password expiration date"
                        className="btn btn-danger"
                        onClick={(choice) => onNotify()}
                    >
                        Notify
                    </button>
            }
            {showUserNotifiedPopup && <CustomPopup child = {
                <>
                    <h4>Email sent to {userDocs[selectedIndex].userData.first} {userDocs[selectedIndex].userData.last}!</h4>
                    <button title="Close popup" onClick={() => setShowUserNotifiedPopup(false)}>Okay</button>
                </>
            }/>}
        </>
    )

}

export default AdminPasswordPage