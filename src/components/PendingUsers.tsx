import { collection, getDocs, query, where } from "firebase/firestore";
import { GetAuthUserDoc, TimeStampToDateString, UserDoc, db, getErrorMessage, storage, toUserDocArray } from "../firebase";
import { getDownloadURL, ref } from "firebase/storage";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function PendingUsers() {

    //User Docs
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [userDocs, setUserDocs] = useState(Array<UserDoc>);
    const [requestedData, setRequestedData] = useState(false);



    const navigate = useNavigate();



    async function GetUserData() {
        /* Request User Docs Once */
        if (requestedData) return;
        setRequestedData(true);

        const queryResults = await getDocs(query(collection(db, "users"), where("verified", "==", false)));
        setUserDocs(toUserDocArray(queryResults));
    }
    if (userDocs.length == 0)
        GetUserData();




    return <div className="trial-balance-document">
        <h4 className="title"> Pending Users</h4>

        {userDocs.length == 0 && <p>No Users Found</p>}
        <table className="table table-bordered table-hover">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>First</th>
                    <th>Last</th>
                    <th>Email</th>
                </tr>
            </thead>
            <tbody>
                {userDocs.map((userDoc: UserDoc, index: number) =>
                    <tr
                        className={"" + (selectedIndex == index && "table-primary")}
                        key={userDoc.username}
                        onClick={() => setSelectedIndex(index)}>
                        <td>{TimeStampToDateString(userDoc.userData.doc)}</td>
                        <td>{userDoc.userData.first}</td>
                        <td>{userDoc.userData.last}</td>
                        <td>{userDoc.userData.email}</td>
                    </tr>
                )}
            </tbody>
        </table>
        {selectedIndex != -1 && //Show view Journal button when one is selected
            <button title="View this user request"
                className="btn btn-success"
                onClick={() => navigate('/private-outlet/admin/verification', { state: userDocs[selectedIndex].username })}>
                View
            </button>}
    </div>
}

export default PendingUsers;