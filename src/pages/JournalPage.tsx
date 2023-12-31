import { useState} from 'react'
import {collection, getDocs,  setDoc, doc, arrayUnion} from 'firebase/firestore';
import { getDocAt, saveDocAt, db, TimeStampToDateString, GetAuthUserDoc, getErrorMessage, storage } from '../firebase';
import Alert from '../components/Alert';
import { useLocation, useNavigate } from "react-router-dom";
import Header from '../components/Header';
import NewJournalPopup from '../components/NewJournalPopup';
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
import CustomPopup from '../components/CustomPopup';
import RejectJournalPopup from '../components/RejectJournalPopup';



function JournalPage() {
    const { state } = useLocation();
    const [selectedIndex, setSelectedIndex] = useState(-1);

    //Journal Docs
    const [journalDocs, setJournalDocs] = useState(Array<{ id: string, data: any , docURL: string}>);
    const [requestedData, setRequestedData] = useState(false);

    //Account ID to Name Map
    const [accountNames, setAccountNames] = useState(new Map<string, string>);

    //Create/Edit Popup State
    const [createPopupShown, setCreatePopupShown] = useState(false);
    const [rejectPopupShown, setRejectPopupShown] = useState(false);

    //Alert State
    const [alertShown, setAlertShown] = useState(false);
    const [alertText, setAlertText] = useState("");
    const [alertColor, setAlertColor] = useState("danger");
    const navigate = useNavigate();

    //Searching State
    const [searchText, setSearchText] = useState("");
    const [searchColumn, setSearchColumn] = useState("account-name");
    const [selectedDate, setSelectedDate] = useState("");
    //Filtering
    const [shownStatus, setShownStatus] = useState("all");
    const [shownType, setShownType] = useState("all"); //Type of Journal Entries to show eg: General, Adjusting



    //url
    const [url, setURL] = useState("");


    //User Role State
    const [userRole, setUserRole] = useState("");

    function GetBalance(accountData: any): number {
        if (accountData.normalSide == 'credit') {
            return accountData.initialBalance + accountData.credit - accountData.debit;
        } else {
            return accountData.initialBalance - accountData.credit + accountData.debit;
        }
    }


    async function GetData() {
        /* REQUEST DATA ONCE */
        setRequestedData(true);

        /* GET USER ROLE */
        const userDocSnapshot = await Promise.resolve(GetAuthUserDoc());
        if (userDocSnapshot == "null") { setAlertShown(true); setAlertColor("danger"); setAlertText(await getErrorMessage("unauthorized")); return; }
        if (userDocSnapshot == "multipleUsers") { setAlertShown(true); setAlertColor("danger"); setAlertText(await getErrorMessage("repeatUserEmail")); return; }
        if (userDocSnapshot == "notFound") { setAlertShown(true); setAlertColor("danger"); setAlertText(await getErrorMessage("noUserEmail")); return; }
        setUserRole(userDocSnapshot.data().role);


        /* GET JOURNAL DATA */
        let queryResult = await getDocs(collection(db, "journals"));
        let allJournalDocs: Array<{ id: string, data: any, docURL: string}> = new Array();
        //add document URLs to individual journalDoc objects and set Journal Data
        for (const doc of queryResult.docs) {
            if(doc.data().documents[0] !== "") {
                const url = await getDownloadURL(ref(storage, doc.data().documents[0]));
                if (url != null) {
                    allJournalDocs.push({ id: doc.id, data: doc.data(), docURL: url});
                }
                else {
                    console.log("Error fetching journal or no document exists")
                    allJournalDocs.push({ id: doc.id, data: doc.data(), docURL: ""});
                }
            } else {
                console.log("Error fetching journal or no document exists")
                allJournalDocs.push({ id: doc.id, data: doc.data(), docURL: ""});
            }
        }
        
        setJournalDocs(allJournalDocs);


        /* GET ACCOUNT DATA */
        queryResult = await getDocs(collection(db, "accounts"));

        let allAccountsMap = new Map<string, string>();
        queryResult.forEach((doc) => {
            allAccountsMap.set(doc.id, doc.data().name);
        })

        setAccountNames(allAccountsMap);


        //Set Selected index to passed in state
        let foundIndex = -1;
        allJournalDocs.forEach((doc, index) =>
        {
            if (doc.id == state) {
                foundIndex = index
                return;
            }
        });
        setSelectedIndex(foundIndex);
    }
    if (!requestedData)
        GetData();

    function HandleJudgeJournal(approve: boolean, comment: string) {
        //Change the selected journal entries status 
        //  to the value of approve parameter
        let newJournalDocs = [...journalDocs];
        newJournalDocs[selectedIndex].data.status = approve ? "approved" : "rejected";

        // if approved, do the following:
        // 1. Get All of the Transactions in the given Journal entry
        // 2. Associate the journal id with every account associated with the transaction. 
        // 3. Update the credit and debit fields for each account
        if (approve) {
            const trans = newJournalDocs[selectedIndex].data.transactions;
            const accountIds = trans.map(updateAccounts);
        }
        else//Not approved, save a comment
            newJournalDocs[selectedIndex].data.rejectionComment = comment;

        //save journal document
        saveDocAt("journals/" + newJournalDocs[selectedIndex].id, newJournalDocs[selectedIndex].data);
        console.log("journals/" + newJournalDocs[selectedIndex].id);

        

        setJournalDocs(newJournalDocs);
    }

    async function updateAccounts(infoObj: { id: string, credit: number, debit: number }) {
        const document1 = await getDocAt("accounts/" + infoObj.id);
        await setDoc(doc(db, "accounts", infoObj.id), {
            credit: document1.get("credit") + infoObj.credit, 
            debit: document1.get("debit") + infoObj.debit, 
            journals: arrayUnion(journalDocs[selectedIndex].id)
        }, {merge:true});
        const name = document1.get("name")
        console.log(name);
        return infoObj.id 
    }
    function MatchesSearch(journalDoc: { id: string, data: any }, index: number): boolean {
        //Returns whether the passed in journal doc's
        //variables matches the current search value

        if (searchColumn == "debit-credit") {
            if (searchText == "") return true;
            const trans = journalDoc.data.transactions.map((infoObj: { id: string, credit: number, debit: number }): boolean => {
                if (infoObj.credit.toString().toLowerCase().includes(searchText.toLowerCase()) || infoObj.debit.toString().toLowerCase().includes(searchText.toLowerCase())) {
                    return true;
                } else return false;
            });
            return trans.includes(true);
        }
        else if (searchColumn == "date") {
            if (selectedDate == "") return true;
            const date = new Date(selectedDate);
            date.setHours(24);
            console.log(date.toLocaleDateString() + " and " + journalDoc.data.date.toDate().toLocaleDateString());
            if (date.toLocaleDateString() == journalDoc.data.date.toDate().toLocaleDateString()) {
                return true;
            } else {
                return false;
            }
        }
        else {
            if (searchText == "") return true;
            const des = journalDoc.data.transactions.map((infoObj: { id: string, credit: number, debit: number }): boolean => {
                if (accountNames.get(infoObj.id)?.toLowerCase().includes(searchText.toLowerCase())) {
                    return true;
                } else return false;
            });
            return des.includes(true);
        }
    }

    /* RETURN HTML */
    return (
        <>
            <Header homePath="/private-outlet/journal" title="Journal" />
            {alertShown && <Alert text={alertText} color={alertColor}></Alert>}
            <button className="btn-block btn btn-success long" onClick={() => setCreatePopupShown(true)}> Create a Journal Entry </button>
            <br /><br />
            <div>
                <label>Search:</label>
                <select
                    value={searchColumn}
                    onChange={(e) => { setSearchColumn(e.target.value); setSelectedDate(''); setSearchText(""); }}
                >
                    <option value="account-name">Account Name</option>
                    <option value="debit-credit">Debit/Credit</option>
                    <option value="date">Date</option>
                </select>
                {searchColumn != "date" &&
                    <input
                        type="text"
                        value={searchText}
                        onChange={(e) => { setSearchText(e.target.value) }}
                    />
                }
                {searchColumn == "date" &&
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => { setSelectedDate(e.target.value) }}
                    />
                }
                <label>Status:</label>
                <select
                    value={shownStatus}
                    onChange={(e) => { setShownStatus(e.target.value) }}
                >
                    <option value="all">All</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                </select>
                <label>Type:</label>
                <select
                    value={shownType}
                    onChange={(e) => { setShownType(e.target.value) }}
                >
                    <option value="all">All</option>
                    <option value="general">General</option>
                    <option value="adjusting">Adjusting</option>
                </select>
            </div>

            {journalDocs.length == 0 && <p>No Journal Entries Found</p>}
            <table className="table table-bordered table-hover">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Debit</th>
                        <th>Credit</th>
                        <th>Documents</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {journalDocs.map((journalDoc: { id: string, data: any, docURL: string }, index: number) =>
                    (MatchesSearch(journalDoc, index) && (shownStatus == "all" || journalDoc.data.status == shownStatus) && (shownType == "all" || journalDoc.data.type == shownType) &&
                        <>
                            <tr
                                className={"" + (selectedIndex == index && "table-primary")}
                                key={journalDoc.id}
                                onClick={() => setSelectedIndex(index)}
                            >
                                <td>{TimeStampToDateString(journalDoc.data.date)}</td>
                            <td> {journalDoc.data.transactions.map(((infoObj: { id: string, credit: number, debit: number }, index: number) => (<>{accountNames.get(infoObj.id)}<br></br></>)))}</td>
                            <td> {journalDoc.data.transactions.map(((infoObj: { id: string, credit: number, debit: number }, index: number) => (<>{infoObj.debit != 0 ? Number(infoObj.debit).toLocaleString(undefined, { minimumFractionDigits: 2 }) : ""}<br></br></>)))}</td>
                            <td> {journalDoc.data.transactions.map(((infoObj: { id: string, credit: number, debit: number }, index: number) => (<>{infoObj.credit != 0 ? Number(infoObj.credit).toLocaleString(undefined, { minimumFractionDigits: 2 }) : ""}<br></br></>)))}</td>
                                <td><a href={journalDoc.docURL}>{journalDoc.data.documents[0].substr(17)}</a></td>
                                <td className={(journalDoc.data.status == "approved" ? "table-success" : journalDoc.data.status == "rejected" ? "table-danger" : "table-warning")}>{journalDoc.data.status}</td>
                            </tr>
                            {journalDocs.map((doc: { id: string, data: any}, index: number) => (<tr></tr>)) /* Make new Rows for each transaction in the journal entry */}
                        </>
                     )
                    )}
                </tbody>
            </table>
            {selectedIndex != -1 && // USER BUTTONS  Only Display Buttons if a User is Selected AND there are users Loaded
                <div className="btn-group">
                    <button title="View this account's details"
                        className="btn btn-secondary"
                        onClick={() => { navigate("/private-outlet/view-account", { state: journalDocs[selectedIndex] }) }}
                    >
                        View
                    </button>

                    {journalDocs[selectedIndex].data.status == "pending" && userRole !== "accountant" &&
                        <>
                        <button title="Approve this journal entry"
                            className="btn btn-success"
                            onClick={() => HandleJudgeJournal(true,"")}>
                            Approve
                        </button>
                        <button title="Reject this journal entry"
                            className="btn btn-danger"
                            onClick={() => setRejectPopupShown(true)}>
                            Reject
                        </button>
                        </>}
                </div>
            }

            {createPopupShown && //Show Change Role Popup if Change Role Popup Shown
                <NewJournalPopup backCallback={() => setCreatePopupShown(false)} confirmCallback={() => { setRequestedData(false); }} accountNames={accountNames} />
            }
            {rejectPopupShown && //Show Reject Journal Popup if Reject Popup Shown
                <RejectJournalPopup backCallback={() => setRejectPopupShown(false)} confirmCallback={(comment) => { HandleJudgeJournal(false, comment); }} journalDoc={journalDocs[selectedIndex]} />
            }
        </>
    );
}

export default JournalPage