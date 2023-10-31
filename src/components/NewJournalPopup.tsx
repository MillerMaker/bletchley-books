import { useState } from "react";
import { GetAuthUserDoc, addDocRandomID, db, UserDoc, getErrorMessage, storage} from "../firebase";
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

    const [transactions, setTransactions] = useState(Array<{ id: string, type: string, amount: number }>);
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
        if (transactions.length < 2) { setAlertColor("danger"); setAlertShown(true); setAlertText(await getErrorMessage("minTwoTransactions")); return; }
        //Check all Credits and Debits
        let total = 0;
        let usedAccounts = new Array<string>;
        let failedInLoop = false;
        await transactions.map(async (infoObj: { id: string, type: string, amount: number }, index: number) =>
        {
            //Confirm debit and credit are positive, Confirm only debit or credit
            if (infoObj.amount < 0) { failedInLoop = true; setAlertColor("danger"); setAlertShown(true); setAlertText(await getErrorMessage("negativeDebitOrCredit")); return; }

            total += infoObj.amount * (infoObj.type == "debit" ? 1 : -1);

            //Confirm no account is associated with multiple transactions
            if (usedAccounts.includes(infoObj.id)) { failedInLoop = true; setAlertColor("danger"); setAlertShown(true); setAlertText(await getErrorMessage("repeatAccountInJournal")); return; }
            usedAccounts.push(infoObj.id);
        })
        if (failedInLoop) return;
        //Confirm Total is 0
        if (total != 0) { setAlertColor("danger"); setAlertShown(true); setAlertText(await getErrorMessage("debitCreditNot0")); return; }



        //Get AuthUserID
        const authUserDoc = await Promise.resolve(GetAuthUserDoc());

        /* UPLOAD FILES */
        const file = e.target.getElementsByClassName("doc")[0].files[0]
        if (!file) {
            console.log("Not a file");
        } else {
            const storageRef = ref(storage, `journalDocuments/${file.name}`);
            uploadBytes(storageRef, file).then(() => {
                console.log("We Uploaded!!!!");
            });
        }

        //Convert Transactions to Transactions 
        //with debit / credit value rather than amount and type
        let transactionsDebitCredit = new Array<{}>;
        transactions.map((transaction: { id: string, type: string, amount: number }) => {
            transactionsDebitCredit.push({
                id: transaction.id,
                debit: transaction.amount * (transaction.type == "debit" ? 1 : 0),
                credit: transaction.amount * (transaction.type == "credit" ? 1 : 0),
            });
        });

        /* CREATE JOURNAL OBJECT */
        let journalDoc = {
            transactions: transactionsDebitCredit,
            description: description,
            status: "pending",
            userID: authUserDoc.id,
            date: Timestamp.now(),
            documents: [file ? `journalDocuments/${file.name}` : ''] 
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
                <h3 className="heading"> Account Information </h3>
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
                    {transactions.map((infoObj: { id: string, type: string, amount: number }, index: number) =>
                    (
                        <div id={String(index)}>
                            <select
                                value={infoObj.id}
                                onChange={(e) => { const newTransactions = [...transactions]; newTransactions[index].id = e.target.value; setTransactions(newTransactions); }}
                            >
                                {Array.from(props.accountNames).map((accountIDNamePair: [string, string]) =>
                                    (<option value={accountIDNamePair[0]} >{accountIDNamePair[1]}</option>)
                                )}
                            </select>
                            <select
                                value={infoObj.type}
                                onChange={(e) => { const newTransactions = [...transactions]; newTransactions[index].type = e.target.value; setTransactions(newTransactions); }}
                            >
                                <option value={"debit"} >Debit</option>)
                                <option value={"credit"} >Credit</option>)

                            </select>
                            <input
                                type="number"
                                value={infoObj.amount}
                                onChange={(e) => { const newTransactions = [...transactions]; newTransactions[index].amount = Number(e.target.value); setTransactions(newTransactions); }}
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
                    <button title="Add a transaction" className="btn btn-success" type="button" onClick={() => { const newTransactions = [...transactions, { id: Array.from(props.accountNames)[0][0], type: "debit", amount: 0 }]; setTransactions(newTransactions); }}>Add Transaction</button>
                    <br></br><br></br>
                    <h6>Add Document (Optional)</h6>
                            <input type='file' className = "doc"/>
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