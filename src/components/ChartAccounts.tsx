import {  useState, useCallback } from 'react'
import { DocumentData, Timestamp, collection, getDoc, getDocs, query, where } from 'firebase/firestore';
import { getDocAt, toUserDocArray, UserData, saveDocAt, UserDoc, db, TimeStampToDateString, auth, GetAuthUserDoc } from '../firebase';
import NewAccountPopup from './NewAccountPopup';
import Alert from './Alert';
import { useNavigate} from "react-router-dom";
import calendarImage from "../assets/calendar-icon.png"
import "./Header.css"
import CustomPopup from './CustomPopup';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';



function ChartAccounts() {
    const [selectedIndex, setSelectedIndex] = useState(-1);

    //Account Docs
    const [accountDocs, setAccountDocs] = useState(Array<{ id: string, data: any }>);
    const [requestedData, setRequestedData] = useState(false);

    //Create/Edit Popup State
    const [createPopupShown, setCreatePopupShown] = useState(false);
    const [editPopupShown, setEditPopupShown] = useState(false);
    const [calendarPopupShown, setCalendarPopupShown] = useState(false);

    //Alert State
    const [alertShown, setAlertShown] = useState(false);
    const [alertText, setAlertText] = useState("");
    const [alertColor, setAlertColor] = useState("danger");
    const navigate = useNavigate();
    //Searching State
    const [searchText, setSearchText] = useState("");
    const [searchColumn, setSearchColumn] = useState("number");

    //User Role State
    const [isAdmin, setIsAdmin] = useState(false);

    function GetBalance(accountData: any): number{
        return accountData.initialBalance - accountData.credit + accountData.debit;
    }


    async function GetData() {
        /* REQUEST DATA ONCE */
        setRequestedData(true);

        /* GET USER ROLE */
        const userDocSnapshot = await Promise.resolve(GetAuthUserDoc());
        if (userDocSnapshot == "null") { setAlertShown(true); setAlertColor("danger"); setAlertText("NOT AUTHORIZED"); return; }
        if (userDocSnapshot == "multipleUsers") { setAlertShown(true); setAlertColor("danger"); setAlertText("MULRIPLE USERS W/SAME EMAIL"); return; }
        if (userDocSnapshot == "notFound") { setAlertShown(true); setAlertColor("danger"); setAlertText("NO USER W/EMAIL"); return; }
        setIsAdmin(userDocSnapshot.data().role == "admin");


        /* GET ACCOUNT DATA */
        const queryResult = await getDocs(collection(db, "accounts"));

        let allAccountDocs: Array<{ id: string, data: any }> = new Array();
        queryResult.forEach((doc) => {
            allAccountDocs.push({ id : doc.id,  data : doc.data() });
        })

        setAccountDocs(allAccountDocs);
    }
    if (!requestedData)
        GetData();







    /* Handle Toggleing User.Active */
    function HandleClickToggleActivate() {
        setAlertShown(false);

        //Only Deactivate accounts with no balance
        const acctData = accountDocs[selectedIndex].data;
        if (acctData.initialBalance + acctData.debit - acctData.credit != 0) { setAlertText("Account has a balance. It cannot be deactivated!"); setAlertShown(true); setAlertColor("danger"); return; }



        let newAccountDocs = [...accountDocs];
        accountDocs[selectedIndex].data.active = !accountDocs[selectedIndex].data.active;
        saveDocAt("accounts/" + accountDocs[selectedIndex].id, accountDocs[selectedIndex].data);
        setAccountDocs(newAccountDocs);
    }



    function MatchesSearch(accountDoc: { id: string, data: any }): boolean {
        //Returns Whether or not the accountDoc's
        //  searchColumn field includes the current searchText

        //Special Case for balance as it is not a field in account
        if (searchColumn == "balance") return GetBalance(accountDoc.data).toString().toLowerCase().includes(searchText.toLowerCase());

        return accountDoc.data[searchColumn].toString().toLowerCase().includes(searchText.toLowerCase());
    }


    /* RETURN HTML */
    return (
        <>
            {alertShown && <Alert text={alertText} color={alertColor}></Alert>}
            <div>
                <button className='calendar-button' onClick={() => {setCalendarPopupShown(true)}}><img src={calendarImage} className='calendar'/></button>
                <label>Search:</label>
                <select
                    value={searchColumn}
                    onChange={(e) => { setSearchColumn(e.target.value) }}
                >
                    <option value="number">Number</option>
                    <option value="name">Name</option>
                    <option value="category">Category</option>
                    <option value="subcategory">Subcategory</option>
                    <option value="balance">Balance</option>
                    <option value="statement">Statement</option>
                    <option value="active">Active</option>
                </select>
                <input
                    type="text"
                    value={searchText}
                    onChange={(e) => { setSearchText(e.target.value) }}
                />
                {isAdmin && //Only Show Create Account if user is Admin
                    <button title="Create a new Account"
                        className="btn-block btn btn-success long" onClick={() => setCreatePopupShown(true)}
                    >
                        Create Account
                    </button>
                }
            </div>
            
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
                        <th>Active</th>
                    </tr>
                </thead>
                <tbody>
                    {accountDocs.map((accountDoc: { id: string, data: any }, index: number) =>
                    (MatchesSearch(accountDoc) &&
                                <tr
                                className={"" + (selectedIndex == index && "table-primary")}
                                key={accountDoc.id}
                                onClick={() => setSelectedIndex(index)}>
                                <td>{accountDoc.data.number}</td>
                                <td>{accountDoc.data.name}</td>
                                <td>{accountDoc.data.category}</td>
                                <td>{accountDoc.data.subcategory}</td>
                                <td>{GetBalance(accountDoc.data).toLocaleString()}</td>
                                <td>{accountDoc.data.statement}</td>
                            <td className={(accountDoc.data.active as boolean ? "table-success" : "table-danger")}>{accountDoc.data.active.toString()}</td>
                            </tr>
                        )     
                    )}
                </tbody>
            </table>
            {accountDocs.length != 0 && selectedIndex != -1 && // USER BUTTONS  Only Display Buttons if a User is Selected AND there are users Loaded
                <div className="btn-group">
                    <button title ="View this account's details"
                        className="btn btn-secondary"
                        onClick={() => {navigate("/private-outlet/view-account", { state : accountDocs[selectedIndex]})}}
                    >
                        View
                    </button>
                    <button title="View this account's details"
                        className="btn btn-primary"
                        onClick={() => { navigate("/private-outlet/ledger", { state: accountDocs[selectedIndex] }) }}
                    >
                        Ledger
                    </button>
                    {isAdmin && //Only Show Activate/Edit Button if user is Admin
                        <>
                            <button title="Edit this account's details"
                                className="btn btn-secondary"
                                onClick={() => { setEditPopupShown(true); }}
                            >
                                Edit
                            </button>
                            <button title="De/activate this account"
                                className={"btn" + (accountDocs[selectedIndex].data.active ? " btn-danger" : " btn-success")}
                                onClick={(choice) => HandleClickToggleActivate()}
                            >
                                {accountDocs[selectedIndex].data.active ? "Deactivate" : "Activate"}
                            </button>
                        </>}
                </div>
            }

            {createPopupShown && //Show Change Role Popup if Change Role Popup Shown
                <NewAccountPopup backCallback={() => setCreatePopupShown(false)} confirmCallback={() => { setRequestedData(false); }} toEdit={{ id: "null", data: null }} />
            }
            {editPopupShown && //Show Change Role Popup if Change Role Popup Shown
                <NewAccountPopup backCallback={() => setEditPopupShown(false)} confirmCallback={() => { setRequestedData(false); }} toEdit={accountDocs[selectedIndex]} />
            }
            {calendarPopupShown && 
                <CustomPopup child={
                    <>
                        <div className='calendar-popup'>
                            <Calendar />
                        </div>
                        <button onClick={() => {setCalendarPopupShown(false)}}>Close</button>
                    </>
                }/>
            } 
        </>
    );
}

export default ChartAccounts;
