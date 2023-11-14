import { DocumentSnapshot, Timestamp, collection, getDocs, query, where } from "firebase/firestore";
import { db, getDocAt, TimeStampToDateString } from "../firebase";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import backButton from "../assets/back_arrow_icon.png";
import Header from '../components/Header'

import "../pages/TrialBalance.css"



interface accountInfo {
    accountData: any, accountID: string, balance: number
}
async function GetAccountInfos(category: string, startDate: Timestamp, endDate: Timestamp): Promise<Array<accountInfo>> {
    //Gets all account balances within a given account category and time range
    //returns an array of account names and balances


    console.log(startDate);

    const accountInfos = new Array<accountInfo>;

    const queryResults = await getDocs(query(collection(db, "accounts"), where("category", "==", category)));

    queryResults.forEach(async (account) => { if (account.exists()) accountInfos.push({ accountData: account.data(), accountID: account.id, balance: 0 }) });

    for (const accountInfo of accountInfos) {

        for (const journalID of accountInfo.accountData.journals) {
            const journalDoc = await getDocAt("journals/" + journalID);
            if (journalDoc.exists())
            if (journalDoc.exists() && journalDoc.data().date.seconds >= startDate.seconds && journalDoc.data().date.seconds <= endDate.seconds)
                journalDoc.data().transactions.forEach((transaction: any) => {
                    if (transaction.id == accountInfo.accountID)
                        accountInfo.balance += (accountInfo.accountData.normalSide == "credit" ? -1 : 1) * (transaction.debit - transaction.credit);
                });
        }

    }


    return accountInfos;
}
function GetTotalBalance(accountInfos: Array<{ accountData: any, accountID: string, balance: number }>): number {
    //Sums balances of a series of account infos
    let total = 0;
    accountInfos.forEach((a) => total += a.balance)

    return total;
}




function IncomeStatement() {
    const [revenueAccountInfos, setRevenueAccountInfos] = useState(Array<accountInfo>);
    const [expenseAccountInfos, setExpenseAccountInfos] = useState(Array<accountInfo>);

    const [requestedData, setRequestedData] = useState(false);

    const navigate = useNavigate();
    const { state } = useLocation(); //Gets the statement to be displayed

    /* VARIOUS AND SUNDRY POPUPS */
    const [emailPopupShown, setEmailPopupShown] = useState(false);


    async function RetrieveData() {
        setRequestedData(true);
        setRevenueAccountInfos(await GetAccountInfos("asset", state.data.startDate, state.data.endDate));
        setExpenseAccountInfos(await GetAccountInfos("expense", state.data.startDate, state.data.endDate));
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
            <h4> Income Statement</h4>
            <h6>for {TimeStampToDateString(state.data.startDate)} : {TimeStampToDateString(state.data.endDate)}</h6>
            <br></br>
            <table className="table">
                <tbody>
                    <tr>
                        <th scope="row"><br></br>Revenue</th>
                        <td>
                            {revenueAccountInfos.map((accountInfo) => <div id={accountInfo.accountID}>{accountInfo.accountData.name}<br></br></div>)}
                            <br></br>Total Revenue
                        </td>
                        <td>
                            {revenueAccountInfos.map((accountInfo) => <div id={accountInfo.accountID}>{accountInfo.balance.toLocaleString()}<br></br></div>)}
                            <br></br>{<>{GetTotalBalance(revenueAccountInfos).toLocaleString()}</>}

                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Expenses</th>
                        <td>
                            {expenseAccountInfos.map((accountInfo) => <div id={accountInfo.accountID}>{accountInfo.accountData.name}<br></br></div>)}
                            <br></br>Total Expenses
                        </td>
                        <td>
                            {expenseAccountInfos.map((accountInfo) => <div id={accountInfo.accountID}>{accountInfo.balance.toLocaleString()}<br></br></div>)}
                            <br></br>{<>{GetTotalBalance(expenseAccountInfos).toLocaleString()}</>}
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Net Income</th>
                        <td>Revenue - Expenses</td>
                        <td>{(GetTotalBalance(revenueAccountInfos) - GetTotalBalance(expenseAccountInfos)).toLocaleString()}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </>
}

export default IncomeStatement;