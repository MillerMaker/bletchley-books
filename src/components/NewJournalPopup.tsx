import { useState } from "react";
import { GetAuthUserDoc, addDocRandomID, db, UserDoc, getErrorMessage} from "../firebase";
import { Timestamp, collection, getDocs, query, where } from "firebase/firestore";
import CustomPopup from "./CustomPopup";
import Alert from "./Alert";
import "./NewUser.css";
import SendEmail from "../Email";
import { toUserDocArray } from "../firebase";

interface Props {
    accountNames: Map<string, string>;//Pass in account ID to get account name
    confirmCallback: () => void;
    backCallback: () => void;
}


function NewJournalPopup(props: Props) {

    const [transactions, setTransactions] = useState(Array<{ id: string, credit: number, debit: number }>);
    const [description, setDescription] = useState("");
    const [adjusting, setAdjusting] = useState(false);

    const [formSubmitted, setFormSubmitted] = useState(false);
    const [alertShown, setAlertShown] = useState(false);
    const [alertText, setAlertText] = useState("");
    const [alertColor, setAlertColor] = useState("danger");




    const handleSubmit = async (e: { preventDefault: () => void; }) =>  {
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
        await transactions.map(async (infoObj: { id: string, credit: number, debit: number }, index: number) =>
        {
            //Confirm debit and credit are positive
            if (infoObj.debit < 0 || infoObj.credit < 0) { failedInLoop = true; setAlertColor("danger"); setAlertShown(true); setAlertText(await getErrorMessage("negativeDebitOrCredit")); return; }

            total += infoObj.debit - infoObj.credit;

            //Confirm no account is associated with multiple transactions
            if (usedAccounts.includes(infoObj.id)) { failedInLoop = true; setAlertColor("danger"); setAlertShown(true); setAlertText(await getErrorMessage("repeatAccountInJournal")); return; }
            usedAccounts.push(infoObj.id);
        })
        //Confirm Total is 0
        if (total != 0) { setAlertColor("danger"); setAlertShown(true); setAlertText(await getErrorMessage("debitCreditNot0")); return; }
        if (failedInLoop) return;



        //Get AuthUserID
        const authUserDoc = await Promise.resolve(GetAuthUserDoc());



        /* CREATE JOURNAL OBJECT */
        let journalDoc = {
            transactions: transactions,
            description: description,
            status: "pending",
            userID: authUserDoc.id,
            date: Timestamp.now()
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
                    <div >
                        <label>Description:</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => { setDescription(e.target.value)}}
                            required
                        />
                    </div>
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
                    <div>
                        <input
                            type="checkbox"
                            value={String(adjusting)}
                            onChange={(e) => { setAdjusting(Boolean(e.target.value)) }}
                        />
                        <label>Adjusting Journal Entry</label>
                    </div>
                    <div className="btn-group">
                        <button title="Submit this journal entry for approval" className="btn btn-primary" type="submit">Submit for Approval</button>
                        <button title="Go back" className="btn btn-secondary" onClick={props.backCallback} type="button">Back</button>
                    </div>
                </form>
            </>} />
    );
}

export default NewJournalPopup;