import { DocumentSnapshot, Timestamp, collection, getDocs, query, where } from "firebase/firestore";
import { db, getDocAt, TimeStampToDateString } from "../firebase";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import backButton from "../assets/back_arrow_icon.png";
import Header from '../components/Header'

import "../pages/TrialBalance.css"
import Year from "react-calendar/dist/cjs/DecadeView/Year";
import StatementHeader from "./StatementHeader";



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
        <StatementHeader GetDocument={() => <></>}
            body={<>
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
            </>} />
    </>
}

export default RetainedEarningsStatement;