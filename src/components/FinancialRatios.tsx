import { getDocs, collection, query } from 'firebase/firestore';
import { useState } from 'react';
import { db } from '../firebase';


import "./FinancialRatios.css"

function FinancialRatios() {
    /*GET DATA BOOL */
    const [requestedData, setRequestedData] = useState(false);

    /*ACCOUNT TOTALS BY CATEGORY*/
    const [totalEquity, setTotalEquity] = useState(0);
    const [totalLiability, setTotalLiability] = useState(0);
    const [totalAsset, setTotalAsset] = useState(0);

    /* RATIO VALUES */
    const [currentRatio, setCurrentRatio] = useState(0);
    const [cashRatio, setCashRatio] = useState(0);
    const [recievablesTurnover, setRecievablesTurnover] = useState(0);
    const [inventoryTurnover, setInventoryTurnover] = useState(0);
    const [debtRatio, setDebtRatio] = useState(0);
    const [debtToEquityRatio, setDebtToEquityRatio] = useState(0);
    const [returnOnAssets, setReturnOnAssets] = useState(0);
    const [grossProfitMargin, setGrossProfitMargin] = useState(0);

    
    /* ACCOUNT DOCS */
    const [accountDocs, setAccountDocs] = useState(Array<{ id: string, data: any }>);


    async function GetData() {
        /* REQUEST DATA ONCE */
        setRequestedData(true);

        let allAccounts = query(collection(db, "accounts"));
        let queryResult = await getDocs(allAccounts);

        let equityAcc: Array<{ id: string, data: any }> = new Array();
        let liabilityAcc: Array<{ id: string, data: any }> = new Array();
        let assetAcc: Array<{ id: string, data: any }> = new Array();

        /* GET JOURNAL ENTRIES */
        let journalDocs = query(collection(db, "journals"));
        let journalQuery = await getDocs(journalDocs);

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

        calculateRatios(assets, liabilities, equity)
        setAccountDocs(accountDocs);

    }

    function calculateRatios(assets: number, liabilities: number , equity : number) {
        /*Current Ratio = Current Assets/Current Liabilities */
        setCurrentRatio(assets/liabilities)
        /*Cash Ratio = (Cash + Marketable Securities)/(Current Liabilities) */
        /*Receivables Turnover = (Annual Credit Sales)/(Accounts Recivable) */
        /*Inventory Turnover = (Cost of Goods Sold)/(Average Inventory) */
        /*Debt Ratio = (Total Debt)/(Total Assets) */
        /*Debt-To-Equity Ratio = (Total Debt)/(Total Assets) */
        /*Return on Assets = (Net Income)/(Total Assets) */
        /*Gross Profit Margin = (Sales-Cost-of-goods Sold)/(Sales) */
    }

    
    if (!requestedData) {
        GetData();
    }
    /*uncomment this line to see the pdf*/
    //ReactDOM.render(MyDocument(), document.getElementById('root'));
    return (
            <>
                <div className="trial-balance-document">
                    <h4 className = "title"> Financial Ratios </h4>
                    <div className = "table-div">
                        <table className = "trial-balance-table">
                            <br></br>
                                <tr className = "dividers">
                                    <td className ="name"> <b>Liquidity</b></td>
                                    <td className = "debits" ></td>
                                </tr>
                                <tr>
                                    <td className ="name">Current Ratio</td>
                                    <td className = {currentRatio > 2 ? 'warning' : currentRatio < 1? 'danger' : "normal" }>{currentRatio.toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td className ="name">Cash Ratio</td>
                                    <td className = "debits" ></td>
                                </tr>
                                <br></br>
                                <tr className = "dividers">
                                    <td className ="name"> <b>Asset Turnover</b> </td>
                                    <td className = "debits" ></td>
                                </tr>
                                <tr>
                                    <td className ="name">Recievables Turnover</td>
                                    <td className = "debits" ></td>
                                </tr>
                                <tr>
                                    <td className ="name">Inventory Turnover</td>
                                    <td className = "debits" ></td>
                                </tr>
                                <br></br>
                                <tr className = "dividers">
                                    <td className ="name"> <b>Financial Leverage</b> </td>
                                    <td className = "debits" ></td>
                                </tr>
                                <tr>
                                    <td className ="name">Debt Ratio</td>
                                    <td className = "debits" ></td>
                                </tr>
                                <tr>
                                    <td className ="name">Debt-To-Equity-Ratio</td>
                                    <td className = "debits" ></td>
                                </tr>
                                <br></br>
                                <tr className = "dividers">
                                    <td className ="name"> <b>Profitability</b> </td>
                                    <td className = "debits" ></td>
                                </tr>
                                <tr>
                                    <td className ="name">Return on Assets</td>
                                    <td className = "debits" ></td>
                                </tr>
                                <tr>
                                    <td className ="name">Gross Profit Margin</td>
                                    <td className = "debits" ></td>
                                </tr>
                        </table>
                    </div>
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

export default FinancialRatios