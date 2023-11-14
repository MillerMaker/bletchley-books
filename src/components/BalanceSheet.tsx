import { getDocs, collection, where, query } from 'firebase/firestore';
import { useState } from 'react';
import { db } from '../firebase';

function BalanceSheet() {
    const [requestedData, setRequestedData] = useState(false);
    const [assetAccounts, setAssetAccounts] = useState(Array<{ id: string, data: any }>);
    const [liabilityAccounts, setLiabilityAccounts] = useState(Array<{ id: string, data: any }>);
    const [equityAccounts, setEquityAccounts] = useState(Array<{ id: string, data: any }>);
    const [totalEquity, setTotalEquity] = useState(0);
    const [totalLiability, setTotalLiability] = useState(0);
    const [totalAsset, setTotalAsset] = useState(0);
    const [emailPopupShown, setEmailPopupShown] = useState(false);

    async function getData() {
        setRequestedData(true);

        let allAccounts = query(collection(db, "accounts"));
        let queryResult = await getDocs(allAccounts);

        let equityAcc: Array<{ id: string, data: any }> = new Array();
        let liabilityAcc: Array<{ id: string, data: any }> = new Array();
        let assetAcc: Array<{ id: string, data: any }> = new Array();

        queryResult.forEach((doc) => {
            console.log(doc)
            if (doc.data().category == 'asset') {
                assetAcc.push({ id: doc.id, data: doc.data() });
                setTotalAsset(totalAsset + doc.data().initialBalance);
            } else if (doc.data().category == 'liability') {
                liabilityAcc.push({ id: doc.id, data: doc.data() });
                setTotalLiability(totalLiability + doc.data().initialBalance);
            }else if (doc.data().category == 'equity') {
                equityAcc.push({ id: doc.id, data: doc.data() });
                setTotalEquity(totalEquity + doc.data().initialBalance);
            } else {
                console.log("Something went wrong getting the financial statements");
            }
        })
        setAssetAccounts(assetAcc);
        setEquityAccounts(equityAcc);
        setLiabilityAccounts(liabilityAcc);
    }

    if(!requestedData) getData();

  return (
    <div>
        <div className ="tools">
            <svg onClick={() => setEmailPopupShown(true)} xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-envelope" viewBox="0 0 16 16">
                <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/>
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className ="bi bi-printer" viewBox="0 0 16 16">
            <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/>
            <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z"/>
            </svg>
        </div>
        <h2>Balance Sheet</h2>
    <div style={{float: "left", margin:"10px"}}>
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
                        ${account.data.initialBalance}
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
        <div style={{float: "right", margin:"10px"}} >
        <h4>Liabilities</h4>
        <table className="table table-bordered" style={{float: 'right'}}>
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
                        ${account.data.initialBalance}
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
        <table className="table table-bordered" style={{float: 'right'}}>
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
                        ${account.data.initialBalance}
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
  )
}

export default BalanceSheet