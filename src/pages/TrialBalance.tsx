import { getDocs, collection, where, query, Timestamp,} from 'firebase/firestore';
import { useNavigate, useLocation } from "react-router"
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

    /* NAVIGATE & LOCATION */
    const navigate = useNavigate();
    const {state} = useLocation(); //Gets the statement to be displayed


    async function GetData() {
        /* REQUEST DATA ONCE */
        setRequestedData(true);

        /* GET ACCOUNTS */
        let q = query(collection(db, "accounts"));
        let accountQuery = await getDocs(q)

        let accountDocs: Array<{ id: string, data: any }> = new Array();
        accountQuery.forEach((doc) => {
            let d = doc.data(); 
            if (d.normalSide == "debit") { d.debit = d.initialBalance; d.credit =0} else {d.credit = d.initialBalance; d.debit = 0;}  
            accountDocs.push({ id : doc.id,  data : d });
        })

        /* GET JOURNAL ENTRIES */
        let journalDocs = query(collection(db, "journals"));
        let journalQuery = await getDocs(journalDocs);

        journalQuery.forEach((journalDoc) => {
            //console.log(state.data.startDate);
            const t1 = new Timestamp(state.data.startDate.seconds, state.data.startDate.nanoseconds).toDate().getTime(); 
            const t2 = new Timestamp(state.data.endDate.seconds, state.data.endDate.nanoseconds).toDate().getTime(); 
            const journalTime = journalDoc.data().date.toDate().getTime();
            //check if journal entry is within specified date range. 
            if (t1 <= journalTime && t2 >= journalTime) {
                console.log(journalDoc.data());
                const transactions = journalDoc.data().transactions;
                //for each transaction, get the associated account, and add the credits and debits
                transactions.map(((trans: { id: string, credit: number, debit: number }) => { 
                    let i = accountDocs.findIndex((infoObj: {id: string, data: any}) => infoObj.id == trans.id);
                    accountDocs[i].data.credit = accountDocs[i].data.credit + trans.credit;
                    accountDocs[i].data.debit = accountDocs[i].data.debit + trans.debit;
                }));
            }
        })
        setAccountDocs(accountDocs);

    }

    if (!requestedData)
    GetData();

    return (
    <>
        <Header title = "TrialBalance" homePath="/private-outlet/admin" ></Header>
        <div className = "Banner">
            <div className = "back"  onClick={() => navigate('/private-outlet/chart-of-accounts')}>
                <img src = {backButton} className = "backIcon"/>
                Back
            </div>
        </div>

             <br></br><br></br>
            <div className = "main">
                <h2> Trial Balance </h2>
                <h6> As At November 13, 2023</h6>
            </div>
            <div className = "table-div">
                <table className = "trial-balance-table">
                    <br></br>
                        <tr className ="dividers">
                            <th></th>
                            <th>Debits</th>
                            <th>Credits</th>
                        </tr>
                        {accountDocs.map((doc, index) => (
                            <tr className = "dividers">
                            <td className ="name">{doc.data.name}</td>
                            <td className = "debits" >{doc.data.debit}</td>
                            <td>{doc.data.credit}</td>
                            </tr>
                        ))}
                        <tr>
                            <td className = "name"> <b>Total</b></td>
                            <td><b>{calculateDebits()}</b></td>
                            <td><b>{calculateCredits()}</b></td>
                        </tr>
                </table>
            </div>

        </>
    );

    function calculateCredits() {
        let credits = 0;
        accountDocs.forEach((doc, index) => {
            credits += doc.data.credit;
        });
        return credits 
    }
    function calculateDebits() {
        let debit = 0;
        accountDocs.forEach((doc, index) => {
            debit += doc.data.debit;
        });
        return debit 
    }
}

export default TrialBalance