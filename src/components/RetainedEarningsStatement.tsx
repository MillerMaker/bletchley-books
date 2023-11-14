import { DocumentSnapshot, Timestamp, collection, getDocs, query, where } from "firebase/firestore";
import { db, getDocAt, TimeStampToDateString } from "../firebase";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import backButton from "../assets/back_arrow_icon.png";
import Header from '../components/Header'

import "../pages/TrialBalance.css"
import Year from "react-calendar/dist/cjs/DecadeView/Year";



interface transaction {
    balance: number,
    date: Timestamp,
    accountID: string
}
async function GetApplicableTransactions(category: string): Promise<Array<transaction>> {
    //Gets all transactions that apply
    //to the given account category
    const transactions = new Array<transaction>;

    const allJournals = await getDocs(collection(db, "journals"));

    //Get all transactions into a list
    allJournals.forEach((journal) => {
        if (!journal.exists()) return;

        journal.data().transactions.forEach((transaction: { debit: number, credit: number, id: string }) =>
            transactions.push({ date: journal.data().date, balance: transaction.debit - transaction.credit, accountID: transaction.id }))
    });

    console.log("Num Trans:" + transactions.length)


    //Remove transactions that apply to other categories
    for (let i = transactions.length-1; i >= 0; i--) {
        const journalDoc = await getDocAt("accounts/" + transactions[i].accountID);
        if (!journalDoc.exists() || journalDoc.data().category != category) {
            transactions.splice(i, 1);
        }
    }

    console.log("Total Applicable Trans:" + transactions.length)

    return transactions;
}
function GetTotalBalance(transactions: Array<transaction>, startDate: Timestamp, endDate: Timestamp): number {
    //Returns the total balance of all
    //transactions that occured within the date range

    let total = 0;
    transactions.forEach((t) => { if (t.date >= startDate && t.date <= endDate) total += t.balance });

    return total;
}




function RetainedEarningsStatement() {
    const [yearlyEarnings, setYearlyEarnings] = useState(Array<{ startBalance: number, changeBalance: number, endBalance: number }>);

    const [requestedData, setRequestedData] = useState(false);

    const navigate = useNavigate();
    const { state } = useLocation(); //Gets the statement to be displayed

    /* VARIOUS AND SUNDRY POPUPS */
    const [emailPopupShown, setEmailPopupShown] = useState(false);

    const endYear = new Date(state.data.endDate.seconds * 1000).getFullYear();
    const startYear = new Date(state.data.startDate.seconds * 1000).getFullYear();
    let years = new Array<number>;
    for (let i = endYear; i >= startYear; i--)
        years.push(i);

    console.log("Start: " + startYear + "    End: " + endYear);

    async function RetrieveData() {
        setRequestedData(true);
        const yearlyEarnings = Array<{ startBalance: number, changeBalance: number, endBalance: number }>();

        const zeroStamp = new Timestamp(0, 0);
        const revenueTransactions = await GetApplicableTransactions("revenue");
        const expenseTransactions = await GetApplicableTransactions("expense");

        for (let i = endYear; i >= startYear; i--) {

            const startStamp = new Timestamp( new Date(i, 0, 1).getTime()/1000, 0);
            const endStamp = new Timestamp(new Date(i+1, 0, 1).getTime()/1000, 0);

            yearlyEarnings.push(
                {
                    startBalance:  GetTotalBalance(revenueTransactions, zeroStamp, startStamp) + GetTotalBalance(expenseTransactions, zeroStamp, startStamp),
                    changeBalance: GetTotalBalance(revenueTransactions, startStamp, endStamp)  + GetTotalBalance(expenseTransactions, startStamp, endStamp),
                    endBalance:    GetTotalBalance(revenueTransactions, zeroStamp, endStamp)   + GetTotalBalance(expenseTransactions, zeroStamp, endStamp)
                });
        }

        setYearlyEarnings(yearlyEarnings);
    }
    if (!requestedData) RetrieveData();


    return <>
        <Header title="TrialBalance" homePath="/private-outlet/admin" ></Header>
        <div className="Banner">
            <div className="back" onClick={() => navigate('/private-outlet/chart-of-accounts')}>
                <img src={backButton} className="backIcon" />
                Back
            </div>
        </div>
        <br></br>

        <div className="trial-balance-document">
            <div className="tools">
                <svg onClick={() => setEmailPopupShown(true)} xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-envelope" viewBox="0 0 16 16">
                    <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-printer" viewBox="0 0 16 16">
                    <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z" />
                    <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z" />
                </svg>
            </div>
            <br></br>
            <h3>{state.data.name}</h3>
            <h4> Retained Earnings Statement</h4>
            <h6>for {startYear} - {endYear}</h6>
            <br></br>
            <table className="table">
                <tbody>
                    <tr>
                        <th scope="row">Year</th>
                        {years.map((year) => <td id={String(year)}>{year}</td>)}
                    </tr>
                    <tr>
                        <th scope="row">Initial Balance</th>
                        {yearlyEarnings.map((year) => <td id={String(year)}>{year.startBalance.toLocaleString()}</td>)}
                    </tr>
                    <tr>
                        <th scope="row">Net Income</th>
                        {yearlyEarnings.map((year) => <td id={String(year)}>{year.changeBalance.toLocaleString()}</td>)}
                        
                    </tr>
                    <tr>
                        <th scope="row">Retained Earnings</th>
                        {yearlyEarnings.map((year) => <td id={String(year)}>{year.endBalance.toLocaleString()}</td>)}
                    </tr>
                </tbody>
            </table>
        </div>
    </>
}

export default RetainedEarningsStatement;