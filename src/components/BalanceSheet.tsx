import { getDocs, collection, where, query } from 'firebase/firestore';
import { useNavigate, useLocation } from "react-router"
import { useState } from 'react';
import { TimeStampToDateString, db } from '../firebase';

import backButton from "../assets/back_arrow_icon.png";
import Header from '../components/Header'

import "./BalanceSheet.css"
import StatementHeader from './StatementHeader';

function BalanceSheet() {
    const [requestedData, setRequestedData] = useState(false);
    const [assetAccounts, setAssetAccounts] = useState(Array<{ id: string, data: any }>);
    const [liabilityAccounts, setLiabilityAccounts] = useState(Array<{ id: string, data: any }>);
    const [equityAccounts, setEquityAccounts] = useState(Array<{ id: string, data: any }>);
    const [totalEquity, setTotalEquity] = useState(0);
    const [totalLiability, setTotalLiability] = useState(0);
    const [totalAsset, setTotalAsset] = useState(0);
    const [emailPopupShown, setEmailPopupShown] = useState(false);

        /* NAVIGATE & LOCATION */
        const navigate = useNavigate();
        const {state} = useLocation(); //Gets the statement to be displayed

    async function getData() {
        setRequestedData(true);

        let allAccounts = query(collection(db, "accounts"));
        let queryResult = await getDocs(allAccounts);

        let equityAcc: Array<{ id: string, data: any }> = new Array();
        let liabilityAcc: Array<{ id: string, data: any }> = new Array();
        let assetAcc: Array<{ id: string, data: any }> = new Array();

        let assets = 0;
        let liabilities = 0;
        let equity =  0;

        queryResult.forEach((doc) => {
            if (doc.data().category == 'asset') {
                assetAcc.push({ id: doc.id, data: doc.data() });
                assets = assets + ( doc.data().initialBalance - doc.data().credit + doc.data().debit);
            } else if (doc.data().category == 'liability') {
                liabilityAcc.push({ id: doc.id, data: doc.data() });
                liabilities = liabilities + ( doc.data().initialBalance + doc.data().credit - doc.data().debit);
            }else if (doc.data().category == 'equity') {
                equityAcc.push({ id: doc.id, data: doc.data() });
                equity = equity + (doc.data().initialBalance + doc.data().credit - doc.data().debit);
            } else {
                console.log("Something went wrong getting the financial statements");
            }
        })

        setTotalAsset(assets)
        setTotalLiability(liabilities)
        setTotalEquity(equity)
        setAssetAccounts(assetAcc);
        setEquityAccounts(equityAcc);
        setLiabilityAccounts(liabilityAcc);
    }

    if(!requestedData) getData();

  return (
    <div>
          <Header title="TrialBalance" homePath="/private-outlet/admin" ></Header>
          <StatementHeader GetDocument={() => <></>}
            body={<>
                <div className = "main">
                <h4>{state.data.name}</h4>
                <h6> Balance Sheet </h6>
                </div>
            <div className = "page-data">
                <div>
                    <h4>Assets</h4>
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>Account Name</th>
                                <th>Account Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                        {assetAccounts.map((account, index) => (
                            <tr>
                                <td>
                                    {account.data.name}
                                </td>
                                <td>
                                    ${account.data.initialBalance - account.data.credit + account.data.debit}
                                </td>
                            </tr>
                        ))}
                        <tr>
                            <td><b>Total Assests</b></td>
                            <td>${totalAsset}</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
                <div className = "liabilities-equity">
                    <h4>Liabilities</h4>
                    <table className="table table-bordered" >
                        <thead>
                            <tr>
                                <th>Account Name</th>
                                <th>Account Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                        {liabilityAccounts.map((account, index) => (
                            <tr>
                                <td>
                                    {account.data.name}
                                </td>
                                <td>
                                    ${account.data.initialBalance + account.data.credit - account.data.debit}
                                </td>
                            </tr>
                        ))}
                        <tr>
                            <td><b>Total Liabilities</b></td>
                            <td>${totalLiability}</td>
                        </tr>
                        </tbody>
                    </table>
                        <h4>Equities</h4>
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>Account Name</th>
                                <th>Account Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                        {equityAccounts.map((account, index) => (
                            <tr>
                                <td>
                                    {account.data.name}
                                </td>
                                <td>
                                    ${account.data.initialBalance + account.data.credit + account.data.debit}
                                </td>
                            </tr>
                        ))}
                        <tr>
                            <td><b>Total Equities</b></td>
                            <td>${totalEquity}</td>
                        </tr>
                        </tbody>
                    </table>
                    <table className="table table-bordered">
                        <tr>
                            <td><b>Total Liabilities & Equities</b></td>
                            <td>${totalEquity + totalLiability}</td>
                        </tr>
                    </table>
                </div>
            </div>
            </>} />
    </div>
  )
}

export default BalanceSheet