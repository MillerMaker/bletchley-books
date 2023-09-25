import Header from '../components/Header'
import { useState } from 'react';
import { UserDoc } from '../firebase';

function AdminVerificationPage() {
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [userDocs, setUserDocs] = useState(Array<UserDoc>);


    return (
        <>
            <Header title="User Verification" homePath="/private-outlet/admin" />
            {userDocs.length == 0 && <h1>No Users Found</h1>}
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
                <button
                    className={"btn btn-success" + (userDocs.length == 0 ? " disabled" : "")}
                    onClick={() => console.log("ACCEPT PRESSED")}
                >
                    ACCEPT
                </button>
                <button
                    className={"btn btn-danger" + (userDocs.length == 0 ? " disabled" : "")} 
                    onClick={() => console.log("REJECT PRESSED")}
                >
                    REJECT
                </button>
            </div>
        </>
    )

}

export default AdminVerificationPage