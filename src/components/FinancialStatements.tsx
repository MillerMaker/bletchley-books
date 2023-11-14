import { getDocs, collection, where, query, Timestamp} from 'firebase/firestore';
import { useNavigate } from "react-router"
import { useState } from 'react';
import { addDocRandomID, db, TimeStampToDateString } from '../firebase';

import "./FinancialStatements.css"
import CustomPopup from './CustomPopup';
import BalanceSheet from './BalanceSheet';
import backArrow from '../assets/back_arrow_icon.png';
import ConfirmPopup from './ConfirmPopup';
import Alert from './Alert';

function FinancialStatements() {
    //navigate
    const navigate = useNavigate();

    /*GET DATA BOOL */
    const [requestedData, setRequestedData] = useState(false);


    /* STATEMENT DOCS */
    const [incomeStatements, setIncomeStatements] = useState(Array<{ id: string, data: any }>);
    const [balanceStatements, setBalanceStatements] = useState(Array<{ id: string, data: any }>);
    const [trialBalanceStatements, setTrialBalanceStatements] = useState(Array<{ id: string, data: any }>);
    const [retainedEarningsStatements, setRetainedEarningsStatements] = useState(Array<{ id: string, data: any }>);
    const [balanceSheetPopupShown, setBalanceSheetPopupShown] = useState(false);

    /* CREATE STATEMENT VARS */
    const [showCreateStatement, setShowCreateStatement] = useState(false);
    const [createType, setCreateType] = useState("");
    const [statementName, setStatementName] = useState("");
    const [startDate, setStartDate] = useState(Timestamp.now());
    const [endDate, setEndDate] = useState(Timestamp.now());
    const [showAlert, setShowAlert] = useState(false);

    function handleSubmit(e: { preventDefault: () => void; }) {
        e.preventDefault();
        //Handles submission of new Statement
        addDocRandomID("statements", { startDate, endDate, name: statementName, type: createType });

        //Get Data again
        setShowAlert(true);
        setShowCreateStatement(false);
        setRequestedData(false);
    }
    function GetStatementName(type: string): string {
        if (type == "trial") return "Trial Balance";
        if (type == "income") return "Income Statement";
        if (type == "balance") return "Balance Sheet";
        if (type == "retained") return "Retained Earnings Statement";
        return "INVALID STATEMENT TYPE"
    }
    async function GetData() {
        /* REQUEST DATA ONCE */
        setRequestedData(true);

        /* GET FINANCIAL STATEMENTS */
        let allStatements = query(collection(db, "statements"));
        let queryResult = await getDocs(allStatements)

        //I'm going to go ahead and sort the statements by type here. 
        let trialStats: Array<{ id: string, data: any }> = new Array();
        let incomeStats: Array<{ id: string, data: any }> = new Array();
        let balanceStats: Array<{ id: string, data: any }> = new Array();
        let retainedStats: Array<{ id: string, data: any }> = new Array();

        queryResult.forEach((doc) => {
            if (doc.data().type == 'trial') {
                trialStats.push({ id: doc.id, data: doc.data() });
            } else if (doc.data().type == 'income') {
                incomeStats.push({ id: doc.id, data: doc.data() });
            }else if (doc.data().type == 'balance') {
                balanceStats.push({ id: doc.id, data: doc.data() });
            }else if (doc.data().type == 'retained') {
                retainedStats.push({ id: doc.id, data: doc.data() });
            } else {
                console.log("Something went wrong getting the financial statements");
            }
        })
        setIncomeStatements(incomeStats);
        setBalanceStatements(balanceStats);
        setTrialBalanceStatements(trialStats);
        setRetainedEarningsStatements(retainedStats);
    }
    if (!requestedData)
    GetData();

    return (
    <>
        <div className = "main">
            <h2> Financial Statements </h2>
            {showAlert && < Alert color="success" text="Statement Created!"></Alert>}

            <h5> Trial Balance Statements </h5>
            {trialBalanceStatements.map((doc, index) => (
                <>
                <li className="list-group-item statement" onClick={() => navigate('/private-outlet/trial-balance' , { state: doc })}>{doc.data.name}</li>
                </>
            ))}
                <li className="list-group-item new-statement" onClick={() => { setCreateType("trial"); setShowCreateStatement(true); }}>New Statement</li>
            <br></br>
            <h5> Balance Statements </h5>
            {balanceStatements.map((doc, index) => (
                <>
                    <li className="list-group-item statement" onClick={() => navigate('/private-outlet/balance-sheet', { state: doc })}>{doc.data.name}</li>
                </>
            ))}
                <li className="list-group-item new-statement" onClick={() => {setBalanceSheetPopupShown(true)}} onClick={() => { setCreateType("balance"); setShowCreateStatement(true); }}>New Statement</li>
            <br></br>
            <h5> Income Statements </h5>
            {incomeStatements.map((doc, index) => (
                <>
                    <li className="list-group-item statement" onClick={() => navigate('/private-outlet/income-statement', { state: doc })}>{doc.data.name}</li>
                </>
            ))}
                    <li className="list-group-item new-statement" onClick={() => { setCreateType("income"); setShowCreateStatement(true); }}>New Statement</li>
            <br></br>
            <h5> Retained Earnings </h5>
            {retainedEarningsStatements.map((doc, index) => (
                <> 
                    <li className="list-group-item statement" onClick={() => navigate('/private-outlet/retained-statement', { state: doc })}>{doc.data.name}</li>
                </>
            ))}
                <li className="list-group-item new-statement" onClick={() => { setCreateType("retained"); setShowCreateStatement(true); }}>New Statement</li>
            <br></br>
        </div>
    {balanceSheetPopupShown && 
    <CustomPopup child={
        <>
            <button className = "btn" onClick={() => {setBalanceSheetPopupShown(false)}} style={{position: 'absolute', top: '10px', left:'30px'}}><img src={backArrow} width={'20px'}></img></button>
            <BalanceSheet />
        </>
    } /> }
            {showCreateStatement &&
                <CustomPopup child=
                {<form className="form-group" onSubmit={handleSubmit}>
                    <h3>Create {GetStatementName(createType)}</h3>
                    <br></br>

                    <span>Statement Name:</span>
                    <input
                    value={statementName}
                    onChange={(e) => { setStatementName(e.target.value) }}
                    required
                    />

                    <br></br>

                    <span>Start Date:</span>
                    <input
                        type="date"
                        value={TimeStampToDateString(startDate)}
                        onChange={(e) => setStartDate(new Timestamp(e.target.valueAsNumber / 1000, 0))}
                    />

                    <br></br>

                    <span>End Date:</span>
                    <input
                        value={TimeStampToDateString(endDate)}
                        onChange={(e) => setEndDate(new Timestamp(e.target.valueAsNumber / 1000, 0))}
                        type="date"
                    />

                    <br></br><br></br>

                    <div className="btn-group">
                        <button title="Confirm"
                            onClick={() => { } }
                            className="btn btn-primary"
                            type="submit"
                        >
                            Confirm
                        </button>
                        <button title="Go back"
                            onClick={() => setShowCreateStatement(false)}
                            className="btn btn-secondary">
                            Back
                        </button>
                    </div>
                </form>}
                />}
    </>
    );
}

export default FinancialStatements