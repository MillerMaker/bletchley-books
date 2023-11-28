import { collection, getDocs } from "firebase/firestore";
import { GetAuthUserDoc, TimeStampToDateString, db, getErrorMessage, storage } from "../firebase";
import { getDownloadURL, ref } from "firebase/storage";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function PendingJournals() {


    const [selectedIndex, setSelectedIndex] = useState(-1);

    //Journal Docs
    const [journalDocs, setJournalDocs] = useState(Array<{ id: string, data: any, docURL: string }>);
    const [requestedData, setRequestedData] = useState(false);

    //Account ID to Name Map
    const [accountNames, setAccountNames] = useState(new Map<string, string>);

    //Alert State
    const [alertShown, setAlertShown] = useState(false);
    const [alertText, setAlertText] = useState("");
    const [alertColor, setAlertColor] = useState("danger");
    const navigate = useNavigate();




    //url
    //const [url, setURL] = useState("");


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
        let allJournalDocs: Array<{ id: string, data: any, docURL: string }> = new Array();
        //add document URLs to individual journalDoc objects and set Journal Data
        for (const doc of queryResult.docs) {
            if (doc.data().documents[0] !== "") {
                const url = await getDownloadURL(ref(storage, doc.data().documents[0]));
                if (url != null) {
                    allJournalDocs.push({ id: doc.id, data: doc.data(), docURL: url });
                }
                else {
                    console.log("Error fetching journal or no document exists")
                    allJournalDocs.push({ id: doc.id, data: doc.data(), docURL: "" });
                }
            } else {
                console.log("Error fetching journal or no document exists")
                allJournalDocs.push({ id: doc.id, data: doc.data(), docURL: "" });
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
    }
    if (!requestedData)
        GetData();

    return <div className="trial-balance-document">
        <h4 className="title"> Pending Journals</h4>
        
            {journalDocs.length == 0 && <p>No Pending Journals</p>}
            <table className="table table-bordered table-hover">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Debit</th>
                        <th>Credit</th>
                    </tr>
                </thead>
                <tbody>
                    {journalDocs.map((journalDoc: { id: string, data: any, docURL: string }, index: number) =>
                    (journalDoc.data.status == "pending") &&
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
                            </tr>
                            {journalDocs.map((doc: { id: string, data: any }, index: number) => (<tr></tr>)) /* Make new Rows for each transaction in the journal entry */}
                        </>
                    )
                    }
                </tbody>
            </table>
            {selectedIndex != -1 && //Show view Journal button when one is selected
            <button title="View this journal entry"
                className="btn btn-success"
                onClick={ () => navigate('/private-outlet/journal', { state: journalDocs[selectedIndex].id })}>
                View
            </button>}
        </div>
}

export default PendingJournals;