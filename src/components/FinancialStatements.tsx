import { getDocs, collection, where, query} from 'firebase/firestore';
import { useNavigate } from "react-router"
import { useState } from 'react';
import { db} from '../firebase';

import "./FinancialStatements.css"

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
            if (doc.data().type = 'trial') {
                trialStats.push({ id: doc.id, data: doc.data() });
            } else if (doc.data().type = 'income') {
                incomeStats.push({ id: doc.id, data: doc.data() });
            }else if (doc.data().type = 'balance') {
                balanceStats.push({ id: doc.id, data: doc.data() });
            }else if (doc.data().type = 'retained') {
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
        
        <h5> Trial Balance Statements </h5>
        {trialBalanceStatements.map((doc, index) => (
            <>
            <li className="list-group-item" onClick={() => navigate('/private-outlet/trial-balance' , { state: doc })}>{doc.data.name}</li>
            </>
        ))}
        <li className="list-group-item new-statement">New Statement</li>
        <br></br>
        <h5> Balance Statements </h5>
        {balanceStatements.map((doc, index) => (
            <>
            <li className="list-group-item">{doc.data.name}</li>
            </>
        ))}
        <li className="list-group-item new-statement">New Statement</li>
        <br></br>
        <h5> Income Statements </h5>
        {incomeStatements.map((doc, index) => (
            <>
            <li className="list-group-item">{doc.data.name}</li>
            </>
        ))}
        <li className="list-group-item new-statement">New Statement</li>
        <br></br>
        <h5> Retained Earnings </h5>
        {retainedEarningsStatements.map((doc, index) => (
            <>
            <li className="list-group-item">{doc.data.name}</li>
            </>
        ))}
        <li className="list-group-item new-statement">New Statement</li>
        <br></br>
    </div>
    </>
    );
}

export default FinancialStatements