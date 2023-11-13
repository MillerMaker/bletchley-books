import { useState } from "react";
import { GetAuthUserDoc, addDocRandomID, db, UserDoc, getErrorMessage, storage, saveDocAt } from "../firebase";
import { Timestamp, collection, getDocs, query, where } from "firebase/firestore";
import CustomPopup from "./CustomPopup";
import Alert from "./Alert";
import "./NewUser.css";
import SendEmail from "../Email";
import { toUserDocArray } from "../firebase";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";

interface Props {
    journalDoc: { data: any, id: string };//Pass in account ID to get account name
    confirmCallback: (comment: string) => void;
    backCallback: () => void;
}


function RejectJournalPopup(props: Props) {

    const [comment, setComment] = useState("");

    const [formSubmitted, setFormSubmitted] = useState(false);
    const [alertShown, setAlertShown] = useState(false);
    const [alertText, setAlertText] = useState("");
    const [alertColor, setAlertColor] = useState("danger");


    const handleSubmit = async (e: { preventDefault: () => void; target: any }) => {
        e.preventDefault();

        if (formSubmitted) return;
        setAlertShown(false);


        /* ERROR HANDLING */
        //Check all Credits and Debits
        let total = 0;
        if (total != 0) { setAlertColor("danger"); setAlertShown(true); setAlertText(await getErrorMessage("debitCreditNot0")); return; }

        //Save Doc
        saveDocAt("journals/" + props.journalDoc.id, props.journalDoc.data);

        //No Resubmits
        setFormSubmitted(true);

        //Completion Alert
        setAlertShown(true);
        setAlertText("Journal Entry Rejected!");
        setAlertColor("success");

        props.confirmCallback(comment); //Fire off Callback
    };

    return (
        <CustomPopup child={
            <>
                <h3 className="heading"> Reject Journal Entry </h3>
                {alertShown && <Alert text={alertText} color={alertColor}></Alert>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <h6>Comment</h6>
                        <textarea
                            value={comment}
                            onChange={(e) => { setComment(e.target.value) }}
                            required
                        />
                    </div>
                    
                    <br></br>
                    <div className="btn-group">
                        <button title="Reject this journal entry" className="btn btn-primary" type="submit">Reject</button>
                        <button title="Go back" className="btn btn-secondary" onClick={props.backCallback} type="button">Back</button>
                    </div>
                </form>
            </>} />
    );
}


export default RejectJournalPopup;
