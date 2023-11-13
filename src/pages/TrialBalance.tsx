import { getDocs, collection, where, query} from 'firebase/firestore';
import { useNavigate } from "react-router"
import { useState } from 'react';
import { db} from '../firebase';

import backButton from "../assets/back_arrow_icon.png";
import Header from '../components/Header'

import "./TrialBalance.css"

function TrialBalance() {
    /*GET DATA BOOL */
    const [requestedData, setRequestedData] = useState(false);
    
    /* ACCOUNT DOCS */
    const [accountDocs, setAccountDocs] = useState(Array<{ id: string, data: any }>);

    /* NAVIGATE */
    const navigate = useNavigate();


    async function GetData() {
        /* REQUEST DATA ONCE */
        setRequestedData(true);

        /* GET ACCOUNTS */
        let allStatements = query(collection(db, "statements"));
        let queryResult = await getDocs(allStatements)

        //I'm going to go ahead and sort the statements by type here. 
        /*
        let trialStats: Array<{ id: string, data: any }> = new Array();

        queryResult.forEach((doc) => {
            if (doc.data().type = 'trial') {
            } else {
                console.log("Something went wrong getting the financial statements");
            }
        })
        setAccountDocs(trialStats);
        */
    }

    /*
    if (!requestedData)
    GetData();
    */

    return (
    <>
        <Header title = "TrialBalance" homePath="/private-outlet/admin" ></Header>
        <div className = "Banner">
            <div className = "back"  onClick={() => navigate('/private-outlet/chart-of-accounts')}>
                <img src = {backButton} className = "backIcon"/>
                Back
            </div>
                     </div>
            <div className = "normal-side">
           
            </div>

        <br></br><br></br>
            <div className = "main">
                <h2> Trial Balance </h2>
                <h6> As At November 13, 2023</h6>
            </div>
        <h5> Trial Balance Statements </h5>
        {accountDocs.map((doc, index) => (
            <>
            <li className="list-group-item">{doc.data.name}</li>
            </>
        ))}
        </>
    );
}

export default TrialBalance