import { useState } from "react";
import { GetAuthUserDoc, addDocRandomID, db, getErrorMessage, saveDocAt } from "../firebase";
import {  Timestamp, collection, getDocs, query, where } from "firebase/firestore";
import CustomPopup from "./CustomPopup";
import { useNavigate } from "react-router-dom"
import Alert from "./Alert";
import "./NewUser.css";

interface Props {
    toEdit: { id: string, data: any };   //Pass in account if you want to edit rather than create
    confirmCallback: () => void;
    backCallback: () => void;
}


function NewAccountPopup(props: Props) {


    const navigate = useNavigate();
    const [lastAccountDoc, setLastAccountDoc] = useState({ id: "", data: null });
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        normalSide: props.toEdit.data.normalSide,
        category: 'asset',
        subcategory:   '',
        initialBalance: 0,
        order: 0,
        statement: '',
        comment: '',
        debit: 0,
        credit: 0,

    });

    const [formSubmitted, setFormSubmitted] = useState(false);
    const [alertShown, setAlertShown] = useState(false);
    const [alertText, setAlertText] = useState("");
    const [alertColor, setAlertColor] = useState("danger");

    function Editing(): boolean{
        return props.toEdit.data != null;
    } 

    //Handle initial field values
    if (Editing() && lastAccountDoc != props.toEdit) {
        setLastAccountDoc(props.toEdit);
        setFormData(props.toEdit.data);
    }



    const handleChange = (e: { target: { name: any; value: any; }; }) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();

        if (formSubmitted) return;
        setAlertShown(false);

        //Generate Account Number
        let leadingNum = 0;
        switch (formData.category) {
            case "asset": leadingNum = 1; break;
            case "liability": leadingNum = 2; break;
            case "equity": leadingNum = 3; break;
            case "revenue": leadingNum = 4; break;
            case "expense": leadingNum = 5; break;
        }                                   //Add Leading zeroes to accountOrder

        console.log(formData.category + leadingNum + "  " + (formData.order.toString().substring(0, 3).padStart(3, "0")));
        const accountNumber = leadingNum + (formData.order.toString().substring(0,3).padStart(3, "0"));

        /* BAD DATA CHECKS */
        if (formData.order.toString().length > 3) { setAlertShown(true); setAlertText(await getErrorMessage("invalidAccountOrder")); setAlertColor("danger"); return; }
        //Account Num Taken
        let queryResults = await getDocs(query(collection(db, "accounts"), where("number", "==", accountNumber)));
        console.log( (Editing() && props.toEdit.data.number == accountNumber) + "   NUM" + accountNumber);
        if ((!Editing() || props.toEdit.data.number != accountNumber) && !queryResults.empty)
        { setAlertShown(true); setAlertText(await getErrorMessage("repeatAccountOrder")); setAlertColor("danger"); return; }
        //Account Name Taken
        queryResults = await getDocs(query(collection(db, "accounts"), where("name", "==", formData.name)));
        if ((!Editing() || props.toEdit.data.name != formData.name) && !queryResults.empty)
        { setAlertShown(true); setAlertText(await getErrorMessage("repeatAccountName")); setAlertColor("danger"); return; }
        //Get AuthUserID
        const authUserDoc = await Promise.resolve(GetAuthUserDoc());



        //Create Object
        const accountDoc = {
            number: accountNumber,
            name: formData.name,
            description: formData.description,
            normalSide: formData.normalSide,
            category: formData.category,
            subcategory: formData.subcategory,
            initialBalance: Number(Number(formData.initialBalance).toFixed(2)), // 0.00610023 -> 0.01
            order: formData.order,
            statement: formData.statement,
            comment: formData.comment,

            active: true,
            debit:  formData.debit,
            credit: formData.credit,
            userID: authUserDoc.id,
            date: Timestamp.now(),
        }

        //Save Doc
        //Editing --> Save Doc
        //!Editing --> New Doc
        if (Editing()) saveDocAt('accounts/' + props.toEdit.id, accountDoc);
        else addDocRandomID('accounts', accountDoc);

        //No Resubmits
        setFormSubmitted(true);

        //Completion Alert
        setAlertShown(true);
        setAlertText("Account " + (Editing() ? "Edited" : "Created") + "!");
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
                        <label htmlFor="name">Name:</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Description:</label>
                        <input
                            type="text"
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="normalSide">Normal Side:</label>
                        <select
                            id="normalSide"
                            name="normalSide"
                            value={formData.normalSide}
                            onChange={handleChange}
                            required
                        >
                            <option value="debit">Debit</option>
                            <option value="credit">Credit</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="category">Category:</label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        >
                            <option value="asset">Asset</option>
                            <option value="liability">Liability</option>
                            <option value="equity">Equity</option>
                            <option value="revenue">Revenue</option>
                            <option value="expense">Expense</option>
                        </select>

                    </div>
                    <div className="form-group">
                        <label htmlFor="subcategory">Subcategory:</label>
                        <input
                            type="text" 
                            id="subcategory"
                            name="subcategory"
                            value={formData.subcategory}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="initialBalance">Initial Balance:</label>
                        <input
                            type="number"
                            id="initialBalance"
                            name="initialBalance"
                            value={formData.initialBalance}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="order">Order:</label>
                        <input
                            type="number"
                            id="order"
                            name="order"
                            value={formData.order}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="statement">Statement:</label>
                        <input
                            type="text"
                            id="statement"
                            name="statement"
                            value={formData.statement}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="comment">Comment:</label>
                        <input
                            type="text"
                            id="comment"
                            name="comment"
                            value={formData.comment}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <br></br>
                    <div className="btn-group">
                        <button title="Confirm these account details" className="btn btn-primary" type="submit">{Editing() ? "Confirm Edit" : "Create Account"}</button>
                        <button title="Go back" className="btn btn-secondary" onClick={props.backCallback}>Back</button>
                    </div>
                </form>
            </>} />
    );
}

export default NewAccountPopup;