import {useState} from 'react'
import {collection, getDocs} from 'firebase/firestore';
import {saveDocAt, db, GetAuthUserDoc, getDocAt, getErrorMessage } from '../firebase';
import NewAccountPopup from './NewAccountPopup';
import Alert from './Alert';
import { useNavigate} from "react-router-dom";
import calendarImage from "../assets/calendar-icon.png";
import reportsImage from "../assets/file-icon.svg";
import "./Header.css";
import CustomPopup from './CustomPopup';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import EmailUserList from './EmailUserList';
import './ChartAccounts.css'
import FinancialStatements from './FinancialStatements';



function ChartAccounts() {
    const [selectedIndex, setSelectedIndex] = useState(-1);

    //Account Docs
    const [accountDocs, setAccountDocs] = useState(Array<{ id: string, data: any }>);
    const [requestedData, setRequestedData] = useState(false);

    //Create/Edit Popup State
    const [createPopupShown, setCreatePopupShown] = useState(false);
    const [editPopupShown, setEditPopupShown] = useState(false);
    const [calendarPopupShown, setCalendarPopupShown] = useState(false);
    const [emailPopupShown, setEmailPopupShown] = useState(false);
    const [statementsPopupShown, setStatementsPopupShown] = useState(false);

    //Alert State
    const [alertShown, setAlertShown] = useState(false);
    const [alertText, setAlertText] = useState("");
    const [alertColor, setAlertColor] = useState("danger");
    const navigate = useNavigate();
    //Searching State
    const [searchText, setSearchText] = useState("");
    const [searchColumn, setSearchColumn] = useState("number");

    //User Role State
    const [role, setRole] = useState("");

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
        setRole(userDocSnapshot.data().role);


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
    async function HandleClickToggleActivate() {
        setAlertShown(false);

        //Only Deactivate accounts with no balance
        const acctData = accountDocs[selectedIndex].data;
        if (acctData.initialBalance + acctData.debit - acctData.credit != 0) { setAlertText(await getErrorMessage("accountBalanceDeactivate")); setAlertShown(true); setAlertColor("danger"); return; }



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
            <div className ='functions'>
                <button className='calendar-button' onClick={() => {setCalendarPopupShown(true)}}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="41" height="41" fill="currentColor" className="bi bi-calendar-event-fill file" viewBox="0 0 16 16">
                    <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z"/>
                    <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                    </svg>  
                </button>

                <svg onClick={() => setEmailPopupShown(true)} xmlns="http://www.w3.org/2000/svg" width="45" height="45" fill="currentColor" className="bi bi-envelope" viewBox="0 0 16 16">
                <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/>
                </svg>
                {role != "accountant" &&
                <div className='reports-button' title="View Financial Statements" onClick={() => setStatementsPopupShown(true)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" fill="currentColor" className="bi bi-file-earmark-bar-graph-fill file" viewBox="0 0 16 16">
                        <path d="M4 11a1 1 0 1 1 2 0v1a1 1 0 1 1-2 0v-1zm6-4a1 1 0 1 1 2 0v5a1 1 0 1 1-2 0V7zM7 9a1 1 0 0 1 2 0v3a1 1 0 1 1-2 0V9z" />
                        <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z" />
                        <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z" />
                    </svg>
                </div>}
            </div>
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
            </div>
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
                                <td >{ <div className = "account-title" onClick = {() => { navigate("/private-outlet/ledger", { state: accountDocs[index]})}}>{accountDoc.data.name}</div>}</td>
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
                    {role =="admin" && //Only Show Activate/Edit Button if user is Admin
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

            {role == "admin" && //Only Show Create Account if user is Admin
            <button title="Create a new Account"
                className="btn-block btn btn-success btn-sm long" onClick={() => setCreatePopupShown(true)}
            >
                Create Account
            </button>
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
            {emailPopupShown && 
                <CustomPopup child={
                    <>
                        <EmailUserList />
                        <button className="btn btn-primary btn-danger" onClick={() => {setEmailPopupShown(false)}}>Cancel</button>
                    </>
            } />
            } 
            {statementsPopupShown && 
                <CustomPopup child={
                    <>
                        <FinancialStatements></FinancialStatements>
                        <br></br>
                        <button className="btn btn-primary btn-secondary" onClick={() => {setStatementsPopupShown(false)}}>Close</button>
                    </>
            } />
            } 

        </>
    );
}

export default ChartAccounts;
