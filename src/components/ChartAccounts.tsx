import {  useState } from 'react'
import { DocumentData, Timestamp, collection, getDoc, getDocs, query, where } from 'firebase/firestore';
import { getDocAt, toUserDocArray, UserData, saveDocAt, UserDoc, db, TimeStampToDateString } from '../firebase';
import NewAccountPopup from './NewAccountPopup';
import Alert from './Alert';



function ChartAccounts() {
    const [selectedIndex, setSelectedIndex] = useState(-1);

    //Account Docs
    const [accountDocs, setAccountDocs] = useState(Array<{ id: string, data: any }>);
    const [requestedData, setRequestedData] = useState(false);

    //Create/Edit Popup State
    const [createPopupShown, setCreatePopupShown] = useState(false);
    const [editPopupShown, setEditPopupShown] = useState(false);


    const [alertShown, setAlertShown] = useState(false);
    const [alertText, setAlertText] = useState("");
    const [alertColor, setAlertColor] = useState("danger");



    function GetBalance(accountData: any): number{
        return accountData.initialBalance - accountData.credit + accountData.debit;
    }


    async function GetAccountDocs() {
        /* Request User Docs Once */
        setRequestedData(true);


        const queryResult = await getDocs(collection(db, "accounts"));

        let allAccountDocs: Array<{ id: string, data: any }> = new Array();
        queryResult.forEach((doc) => {
            allAccountDocs.push({ id : doc.id,  data : doc.data() });
        })

        setAccountDocs(allAccountDocs);
    }
    if (!requestedData)
        GetAccountDocs();







    /* Handle Toggleing User.Active */
    function HandleClickToggleActivate() {

        setAlertShown(false);

        //Only Deactivate accounts with no balance
        const acctData = accountDocs[selectedIndex].data;
        console.log(acctData.initialBalance + acctData.debit - acctData.initialBalance);
        if (acctData.initialBalance + acctData.debit - acctData.credit != 0) { setAlertText("Account cannot be activated with a balance!"); setAlertShown(true); setAlertColor("danger"); return; }

        let newAccountDocs = [...accountDocs];
        accountDocs[selectedIndex].data.active = !accountDocs[selectedIndex].data.active;
        saveDocAt("accounts/" + accountDocs[selectedIndex].id, accountDocs[selectedIndex].data);
        setAccountDocs(newAccountDocs);
    }





    /* RETURN HTML */
    return (
        <>
            {alertShown && <Alert text={alertText} color={alertColor}></Alert>}
            <button
                className="btn-block btn btn-success long" onClick={() => setCreatePopupShown(true)}
            >
                Create Account
            </button>
            <br></br><br></br>
            {accountDocs.length == 0 && <p>No Accounts Found</p>}
            <table className="table table-bordered table-hover">
                <thead>
                    <tr>
                        <th>Number</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>SubCategory</th>
                        <th>Balance</th>
                        <th>Financial Statement</th>
                    </tr>
                </thead>
                <tbody>
                    {accountDocs.map((accountDoc: { id: string, data: any }, index: number) =>
                        <tr
                            className={"" + (selectedIndex == index && "table-primary")}
                            key={accountDoc.id}
                            onClick={() => setSelectedIndex(index)}>
                            <td>{accountDoc.id}</td>
                            <td>{accountDoc.data.name}</td>
                            <td>{accountDoc.data.category}</td>
                            <td>{accountDoc.data.subcategory}</td>
                            <td>{GetBalance(accountDoc.data)}</td>
                            <td>{accountDoc.data.statement}</td>

                        </tr>
                    )}
                </tbody>
            </table>
            {accountDocs.length != 0 && selectedIndex != -1 && // USER BUTTONS  Only Display Buttons if a User is Selected AND there are users Loaded
                <div className="btn-group">
                    <button
                        className="btn btn-secondary"
                        onClick={() => { }}
                    >
                        View
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => { setEditPopupShown(true); }}
                    >
                        Edit
                    </button>
                    <button
                        className={"btn" + (accountDocs[selectedIndex].data.active ? " btn-danger" : " btn-success")}
                        onClick={(choice) => HandleClickToggleActivate()}
                    >
                        {accountDocs[selectedIndex].data.active ? "Deactivate" : "Activate"}
                    </button>
                </div>
            }

            {createPopupShown && //Show Change Role Popup if Change Role Popup Shown
                <NewAccountPopup backCallback={() => setCreatePopupShown(false)} confirmCallback={() => { setRequestedData(false); }} toEdit={{ id: "null", data: null }} />
            }
            {editPopupShown && //Show Change Role Popup if Change Role Popup Shown
                <NewAccountPopup backCallback={() => setEditPopupShown(false)} confirmCallback={() => { setRequestedData(false); }} toEdit={accountDocs[selectedIndex]} />
            }
        </>
    );
}

export default ChartAccounts;
