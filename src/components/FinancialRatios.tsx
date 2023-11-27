import { getDocs, collection, query } from 'firebase/firestore';
import { useState } from 'react';
import { db } from '../firebase';


import "./FinancialRatios.css"

function FinancialRatios() {
    /*GET DATA BOOL */
    const [requestedData, setRequestedData] = useState(false);

    /*ACCOUNT TOTALS BY CATEGORY*/
    const [totalAssets, setTotalAssets] = useState(0)
    const [totalLiabilities, setTotalLiabilities] = useState(0)
    const [totalSales, setTotalSales] = useState(0)

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

        let assets = 0;

        journalQuery.forEach((journalDoc) => {
            //console.log(state.data.startDate);
            const transactions = journalDoc.data().transactions;
            //Check journal entry approved
            if(journalDoc.data().status == "approved") {
                //for each transaction, get the associated account, and add the credits and debits
                transactions.map(((trans: { id: string, credit: number, debit: number }) => { 
                    let i = accountDocs.findIndex((infoObj: {id: string, data: any}) => infoObj.id == trans.id);
                    console.log(accountDocs[i].data.category)
                    //Tally Total Assets, Liabilities, Sales, Debt, Equity
                    switch(accountDocs[i].data.category) {
                        case "asset":
                                console.log("Total Assets" + assets)
                                assets = assets + trans.debit - trans.credit
                                break;
                    }
                    accountDocs[i].data.credit = accountDocs[i].data.credit + trans.credit;
                    accountDocs[i].data.debit = accountDocs[i].data.debit + trans.debit;
                }));
            }
        })

        calculateRatios(assets)
        setAccountDocs(accountDocs);

    }

    function calculateRatios(assets: number) {
        /*Current Ratio = Current Assets/Current Liabilities */
        setCurrentRatio(assets)
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
                                    <td className = "debits" >{currentRatio.toLocaleString()}</td>
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