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