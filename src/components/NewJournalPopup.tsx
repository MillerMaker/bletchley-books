import { useState } from "react";
import { GetAuthUserDoc, addDocRandomID, db, UserDoc, storage} from "../firebase";
import { Timestamp, collection, getDocs, query, where } from "firebase/firestore";
import CustomPopup from "./CustomPopup";
import Alert from "./Alert";
import "./NewUser.css";
import SendEmail from "../Email";
import { toUserDocArray } from "../firebase";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";

interface Props {
    accountNames: Map<string, string>;//Pass in account ID to get account name
    confirmCallback: () => void;
    backCallback: () => void;
}


function NewJournalPopup(props: Props) {

    const [transactions, setTransactions] = useState(Array<{ id: string, credit: number, debit: number }>);
    const [description, setDescription] = useState("");

    const [formSubmitted, setFormSubmitted] = useState(false);
    const [alertShown, setAlertShown] = useState(false);
    const [alertText, setAlertText] = useState("");
    const [alertColor, setAlertColor] = useState("danger");

    //Document Storage
    const [docUrl, setDocUrl] = useState("");
    const [progresspercent, setProgresspercent] = useState(0);

    //test submit
    const [testSubmitted, setTestSubmitted] = useState(false);

    function testSubmission(e: { preventDefault: () => void; target: any }) {

        if(testSubmitted== false) {
              /* UPLOAD FILES */
            e.preventDefault();
            const file = e.target.files[0]
            console.log("This file's name is: " + file.name );
            if (!file) {
                console.log("Not a file");
            } else {
                const storageRef = ref(storage, `journalDocuments/${file.name}`);
                uploadBytes(storageRef, file).then(() => {
                    console.log("We Uploaded!!!!");
                });
            }
        }
        setTestSubmitted(true);
    }



    const handleSubmit = async (e: { preventDefault: () => void; target: any }) => {
        e.preventDefault();
        
        if (formSubmitted) return;
        setAlertShown(false);

        /* ERROR HANDLING */
        //Confirm there are at least 2 transactions
        if (transactions.length < 2) { setAlertColor("danger"); setAlertShown(true); setAlertText("Must enter at least two transactions!"); return; }
        //Check all Credits and Debits
        let total = 0;
        let usedAccounts = new Array<string>;
        transactions.map((infoObj: { id: string, credit: number, debit: number }, index: number) =>
        {
            //Confirm debit and credit are positive
            if (infoObj.debit < 0 || infoObj.credit < 0) { setAlertColor("danger"); setAlertShown(true); setAlertText("Credits and Debits must be positive!"); return; }
            //Confirm no account is associated with multiple transactions
            if (usedAccounts.includes(infoObj.id)) { setAlertColor("danger"); setAlertShown(true); setAlertText("The same account cannot appear multiple times in a single entry!"); return; }
            usedAccounts.push(infoObj.id);

            total += infoObj.debit - infoObj.credit;
        })
        //Confirm Total is 0
        if (total != 0) { setAlertColor("danger"); setAlertShown(true); setAlertText("Total of debits and credits is not 0!"); return; }



        //Get AuthUserID
        const authUserDoc = await Promise.resolve(GetAuthUserDoc());


        /* UPLOAD FILES */
        const file = e.target.files[0]
        if (!file) {
            console.log("Not a file");
        } else {
            const storageRef = ref(storage, `journalDocuments/${file.name}`);
            uploadBytes(storageRef, file).then(() => {
                journalDoc
                console.log("We Uploaded!!!!");
            });
        }

        /* CREATE JOURNAL OBJECT */
        let journalDoc = {
            transactions: transactions,
            description: description,
            status: "pending",
            userID: authUserDoc.id,
            date: Timestamp.now(),
            document: `journalDocuments/${file.name}`
        }
        //Add all transactions to a transaction array
        //transactions.map((infoObj: { id: string, credit: number, debit: number }, index: number) => { journalDoc[infoObj.id] = infoObj; });

        //Notify Manager of Journal Entry
        const queryResults = await getDocs(query(collection(db, "users"), where("role", "==", "manager")));
        const userDocs = toUserDocArray(queryResults);
        userDocs.forEach((userDoc: UserDoc, index: number) => {
            SendEmail( userDoc.userData.email, "New Journal Entry Awaiting Verification", 
            "A new journal entry has been created, and is awaiting verification. Please " +
            "head to the journal entry page to accept or decline this journal entry. ");
            console.log("Sent an email to " + userDoc.userData.email);
        }) 

        //Save Doc
        addDocRandomID('journals', journalDoc);

        //No Resubmits
        setFormSubmitted(true);

        //Completion Alert
        setAlertShown(true);
        setAlertText("Journal Entry Created!");
        setAlertColor("success");
        
        props.confirmCallback(); //Fire off Callback
    };

    return (
        <CustomPopup child={
            <>
                <h3 className="heading"> Account Information  </h3>
                {alertShown && <Alert text={alertText} color={alertColor}></Alert>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <h6>Description (Optional)</h6>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => { setDescription(e.target.value)}}
                            required
                        />
                    </div>
                    <br></br>
                    {transactions.map((infoObj: { id: string, credit: number, debit: number }, index: number) =>
                    (
                        <div>
                            <select
                                value={infoObj.id}
                                onChange={(e) => { const newTransactions = [...transactions]; newTransactions[index].id = e.target.value; setTransactions(newTransactions); }}
                            >
                                {Array.from(props.accountNames).map((accountIDNamePair: [string, string]) =>
                                    (<option value={accountIDNamePair[0]} >{accountIDNamePair[1]}</option>)
                                )}
                            </select>
                            <input
                                type="number"
                                value={infoObj.debit}
                                onChange={(e) => { const newTransactions = [...transactions]; newTransactions[index].debit = Number(e.target.value); setTransactions(newTransactions); }}
                                required
                            />
                            <input
                                type="number"
                                value={infoObj.credit}
                                onChange={(e) => { const newTransactions = [...transactions]; newTransactions[index].credit = Number(e.target.value); setTransactions(newTransactions); }}
                                required
                            />
                            <button
                                title="Remove a transaction"
                                className="btn btn-danger"
                                onClick={() => { const newTransactions = [...transactions]; newTransactions.splice(index, 1); setTransactions(newTransactions); }}>
                                Remove
                            </button>
                        </div>
                    ))}
                    <button title="Add a transaction" className="btn btn-success" type="button" onClick={() => { const newTransactions = [...transactions, { id: Array.from(props.accountNames)[0][0], debit: 1, credit: 2 }]; setTransactions(newTransactions); }}>Add Transaction</button>
                    <br></br><br></br>
                    <h6>Add Document (Optional)</h6>
                            <input type='file' onChange = {testSubmission}/>
                    <br></br><br></br>
                    <div className="btn-group">
                        <button title="Submit this journal entry for approval" className="btn btn-primary" type="submit">Submit for Approval</button>
                        <button title="Go back" className="btn btn-secondary" onClick={props.backCallback} type="button">Back</button>
                    </div>
                </form>
            </>} />
    );
}

export default NewJournalPopup;