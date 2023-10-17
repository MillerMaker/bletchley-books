import React, { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"
import { ContainsEmail, HashString, UserData, UserDoc, auth, db, getDocAt, saveDocAt } from "../firebase";
import { CollectionReference, Timestamp, addDoc, collection, getDocs, or, query, where } from "firebase/firestore";
import CustomPopup from "./CustomPopup";
import { useNavigate } from "react-router-dom"
import PasswordChecklist from "react-password-checklist"
import Alert from "./Alert";
import "./NewUser.css";
import SendEmail from "../Email";
import { TimeStampToDateString } from "../firebase";

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
        normalSide: '',
        category: '',
        subcategory:   '',
        initialBalance: 0,
        order: 0,
        statement: '',
        comment: '',

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
        const accountNumber = leadingNum + formData.order.toString().padStart(3, "0");

        /* BAD DATA CHECKS */
        //Account Num Taken
        if (!Editing && (await getDocAt("accounts/" + accountNumber)).exists()) { setAlertShown(true); setAlertText("Account Order is taken"); setAlertColor("danger"); return; }
        //Account Name Taken
        let queryResults = await getDocs(query(collection(db, "accounts"), where("name", "==", formData.name)));
        if (!Editing() && !queryResults.empty) { setAlertShown(true); setAlertText("Account name is taken"); setAlertColor("danger"); return; }




        //Create Object
        const accountDoc = {
            name: formData.name,
            description: formData.description,
            normalSide: formData.normalSide,
            category: formData.category,
            subcategory: formData.subcategory,
            initialBalance: Number(formData.initialBalance).toFixed(2),
            order: formData.order,
            statement: formData.statement,
            comment: formData.comment,

            active: true,
            debit: Number(0).toFixed(2),
            credit: Number(0).toFixed(2),
            date: Timestamp.now(),
        }

        //Save Doc Show Alert
        saveDocAt('accounts/' + accountNumber, accountDoc);
        setFormSubmitted(true);
        setAlertShown(true);
        setAlertText("Account " + (Editing() ? "Edited" : "Created") + "!");
        setAlertColor("success");


    };



    return (
        <CustomPopup child={
            <>
                <h5 className="heading"> Account Information  </h5>
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
                            min={0}
                            max={999}
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
                    <div className="form-group">
                        <button className="btn btn-primary" type="submit">{Editing() ? "Confirm Edit" : "Create Account"}</button>
                        <button className="btn btn-primary" onClick={props.backCallback}>Back</button>
                    </div>
                </form>
            </>} />
    );
}

export default NewAccountPopup;