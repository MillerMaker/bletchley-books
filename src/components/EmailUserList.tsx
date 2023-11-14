import { useState } from 'react'
import { UserDoc, db, toUserDocArray } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import SendEmail, {SendEmailWithLink} from '../Email';

interface Props {
    hasAttatchment: boolean;
    AdditionalText: string
}


function EmailUserList(props: Props) {
    const [userDocs, setUserDocs] = useState(Array<UserDoc>);
    const [requestedData, setRequestedData] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [emailSubjectValue, setEmailSubjectValue] = useState("");
    const [emailTextValue, setEmailTextValue] = useState("");
    const [invalidEmailFormat, setInvalidEmailFormat] = useState(false);

    async function GetUserData() {
        /* Request User Docs Once */
        if (requestedData) return;
        setRequestedData(true);


        const queryResults = await getDocs(query(collection(db, "users"), where("verified", "==", true)));
        setUserDocs(toUserDocArray(queryResults));
    }

    if (userDocs.length == 0){
        GetUserData();
    }

    function HandleEmailRequest() {
        if (emailSubjectValue == "" || emailTextValue == "") {
            setInvalidEmailFormat(true);
            return;
        }

        console.log("Request to send email to: " + userDocs[selectedIndex].userData.email);
        SendEmail( userDocs[selectedIndex].userData.email,emailSubjectValue,emailTextValue)
    }

    function HandleEmailRequestWithLink() {
        if (emailSubjectValue == "" || emailTextValue == "") {
            setInvalidEmailFormat(true);
            return;
        }

        console.log("Request to send email to: " + userDocs[selectedIndex].userData.email);
        SendEmailWithLink( userDocs[selectedIndex].userData.email,emailSubjectValue,emailTextValue, props.AdditionalText)
    }

    return (
        <>
        {userDocs.length == 0 && <p>No Users Found</p>}
            {selectedIndex == -1 && 
            <table className="table table-bordered table-hover">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>First</th>
                        <th>Last</th>
                        <th>Role</th>
                        <th>Active</th>
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
                            <td>{userDoc.userData.role}</td>
                            <td className={(userDoc.userData.active as boolean ? "table-success" : "table-danger")}>{userDoc.userData.active.toString()}</td>
                        </tr>
                    )}
                </tbody>
            </table>}
            {selectedIndex != -1 && !props.hasAttatchment &&
            <>
                <h3>Email {userDocs[selectedIndex].userData.email}</h3>
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
                {invalidEmailFormat && <h5>Invalid Email Format</h5>}
                <button className='btn btn-success' onClick={() => {HandleEmailRequest()}}>Send</button>
                <button className='btn btn-primary' onClick={() => {setSelectedIndex(-1)}}>Back</button>
            </>
            }
            {selectedIndex != -1 && props.hasAttatchment &&
            <>
                <h3>Email {userDocs[selectedIndex].userData.email}</h3>
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
                                placeholder= {"Message: (i.e: enclosed is the link to the report) "}
                            >
                            </textarea>
                        </div>
                </form>
                {invalidEmailFormat && <h5>Invalid Email Format</h5>}
                <button className='btn btn-success' onClick={() => {HandleEmailRequestWithLink()}}>Send</button>
                <button className='btn btn-primary' onClick={() => {setSelectedIndex(-1)}}>Back</button>
            </>
            }
        </>
    )
}

export default EmailUserList