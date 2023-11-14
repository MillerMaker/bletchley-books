import { DocumentSnapshot, Timestamp, collection, getDocs, query, where } from "firebase/firestore";
import { db, getDocAt, TimeStampToDateString } from "../firebase";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import backButton from "../assets/back_arrow_icon.png";
import Header from '../components/Header'

import "../pages/TrialBalance.css"
import StatementHeader from "./StatementHeader";



interface accountInfo {
    accountData: any, accountID: string, balance: number
}
async function GetAccountInfos(category: string, startDate: Timestamp, endDate: Timestamp): Promise<Array<accountInfo>> {
    //Gets all account balances within a given account category and time range
    //returns an array of account names and balances


    //Get All Journal Docs into array
    const journalDocs: Array<{ id: string, data: any }> = new Array();
    (await getDocs(query(collection(db, "journals")))).forEach((doc) => { journalDocs.push({ id: doc.id, data: doc.data() }) });

    //Get All Accounts of matching category into array
    const accountInfos = new Array<accountInfo>;
    const accountDocs = await getDocs(query(collection(db, "accounts"), where("category", "==", category)));

    accountDocs.forEach(async (account) => { if (account.exists()) accountInfos.push({ accountData: account.data(), accountID: account.id, balance: 0 }) });

    //Sum balances
    for (const accountInfo of accountInfos) {
        for (const journalID of accountInfo.accountData.journals) {
            let i = journalDocs.findIndex((infoObj: { id: string, data: any }) => infoObj.id == journalID);
            if (journalDocs[i].data.date.seconds >= startDate.seconds && journalDocs[i].data.date.seconds <= endDate.seconds)
                journalDocs[i].data.transactions.forEach((transaction: any) => {
                    if (transaction.id == accountInfo.accountID)
                        accountInfo.balance += (accountInfo.accountData.normalSide == "credit" ? 1 : -1) * (transaction.debit - transaction.credit);
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

    const { state } = useLocation(); //Gets the statement to be displayed

    /* VARIOUS AND SUNDRY POPUPS */
    const [emailPopupShown, setEmailPopupShown] = useState(false);


    async function RetrieveData() {
        setRequestedData(true);
        setRevenueAccountInfos(await GetAccountInfos("revenue", state.data.startDate, state.data.endDate));
        setExpenseAccountInfos(await GetAccountInfos("expense", state.data.startDate, state.data.endDate));
    }
    if (!requestedData) RetrieveData();



    return <>
        <Header title="TrialBalance" homePath="/private-outlet/admin" ></Header>
        <StatementHeader GetDocument={() => <></>}
            body={<>
                <h4>{state.data.name}</h4>
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
            </>}
            
        />
    </>
}

export default IncomeStatement;