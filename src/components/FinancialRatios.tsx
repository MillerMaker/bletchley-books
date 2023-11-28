import { getDocs, collection, query } from 'firebase/firestore';
import { useState } from 'react';
import { db } from '../firebase';


import "./FinancialRatios.css"

function FinancialRatios() {
    /*GET DATA BOOL */
    const [requestedData, setRequestedData] = useState(false);


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
        let accounts: Array<{id: string, data: any}> = new Array();

        /* GET JOURNAL ENTRIES */
        let journalDocs = query(collection(db, "journals"));
        let journalQuery = await getDocs(journalDocs);

        let assets = 0;
        let liabilities = 0;
        let equity = 0;

        //Subset of Assets
        let receivable = 0;
        let inventory = 0;

        //Subset of Equity
        let revenue = 0;
        let sales = 0;
        let expenses = 0;
        let costOfGoodsSold = 0;


        queryResult.forEach((doc) => {

            //Sum assets Liability Equity
            if (doc.data().category == 'asset') {
                assetAcc.push({ id: doc.id, data: doc.data() });
                assets = assets + (doc.data().initialBalance - doc.data().credit + doc.data().debit);

                if (doc.data().subcategory == 'receivable') receivable += (doc.data().initialBalance - doc.data().credit + doc.data().debit);
                if (doc.data().subcategory == 'inventory') inventory += (doc.data().initialBalance - doc.data().credit + doc.data().debit);
            } else if (doc.data().category == 'liability') {
                liabilityAcc.push({ id: doc.id, data: doc.data() });
                liabilities = liabilities + ( doc.data().initialBalance + doc.data().credit - doc.data().debit);
            }else if (doc.data().category == 'equity') {
                equityAcc.push({ id: doc.id, data: doc.data() });
                equity = equity + (doc.data().initialBalance + doc.data().credit - doc.data().debit);

                if (doc.data().subcategory == 'revenue') revenue += (doc.data().initialBalance + doc.data().credit - doc.data().debit);
                if (doc.data().subcategory == 'expenses') expenses += (doc.data().initialBalance + doc.data().credit - doc.data().debit);
                if (doc.data().name == 'Sales') sales += (doc.data().initialBalance + doc.data().credit - doc.data().debit);
                if (doc.data().name == 'Cost of Goods') costOfGoodsSold += (doc.data().initialBalance - doc.data().credit + doc.data().debit);
            } else {
                console.log("Something went wrong getting the financial statements");
            }


            accounts.push({id: doc.id, data: doc.data()});
        })

        setAccountDocs(accounts);


        calculateRatios(assets, liabilities, equity, receivable, inventory, revenue, expenses, sales, costOfGoodsSold, accounts)
    }

    if (!requestedData) {
        GetData();
    }

    async function getCashRatio(accounts: Array<{id: string, data: any}>, liabilities: number){
        let cashTotal = 0;
        accounts.forEach((doc) => {
            if(doc.data.name == "Marketable Securities" || doc.data.name == "Cash")
            {
                cashTotal = cashTotal + doc.data.credit + doc.data.debit;
            }
        })
        setCashRatio(cashTotal / liabilities);
    }

    function calculateRatios(assets: number, liabilities: number, equity: number, receivable: number, inventory: number, revenue: number, expenses: number, sales: number, costOfGoods: number, accounts: Array<{ id: string, data: any }>) {
        /*Current Ratio = Current Assets/Current Liabilities */
        setCurrentRatio(assets/liabilities)
        /*Cash Ratio = (Cash + Marketable Securities)/(Current Liabilities) */
        getCashRatio(accounts, liabilities);
        /*Receivables Turnover = (Annual Credit Sales)/(Accounts Recivable) */
        setRecievablesTurnover(sales / receivable);
        /*Inventory Turnover = (Cost of Goods Sold)/(Average Inventory) */
        setInventoryTurnover(costOfGoods / inventory);
        /*Debt Ratio = (Total Debt)/(Total Assets) */
        setDebtRatio(liabilities / assets);
        /*Debt-To-Equity Ratio = (Total Debt)/(Total Assets) */
        setDebtToEquityRatio(liabilities / equity);
        /*Return on Assets = (Net Income)/(Total Assets) */
        setReturnOnAssets((revenue - expenses) / assets);
        /*Gross Profit Margin = (Sales-Cost-of-goods Sold)/(Sales) */
        setGrossProfitMargin((sales - costOfGoods) / sales);
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
                                    <td className = {cashRatio <.25 ? 'danger' : cashRatio < .75? 'warning' : "normal" } >{cashRatio.toLocaleString()}</td>
                                </tr>
                                <br></br>
                                <tr className = "dividers">
                                    <td className ="name"> <b>Asset Turnover</b> </td>
                                    <td className="debits" ></td>
                                </tr>
                                <tr>
                                    <td className ="name">Recievables Turnover</td>
                                    <td className={recievablesTurnover < .5 ? 'danger' : recievablesTurnover < 1 ? 'warning' : "normal"} >{recievablesTurnover.toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td className ="name">Inventory Turnover</td>
                                    <td className={inventoryTurnover < 1 ? 'danger' : inventoryTurnover < 2 ? 'warning' : "normal"} >{inventoryTurnover.toLocaleString()}</td>
                                </tr>
                                <br></br>
                                <tr className = "dividers">
                                    <td className ="name"> <b>Financial Leverage</b> </td>
                                    <td className = "debits" ></td>
                                </tr>
                                <tr>
                                    <td className ="name">Debt Ratio</td>
                                    <td className={debtRatio > .5 ? 'danger' : debtRatio < .35 ? 'normal' : "warning"} >{debtRatio.toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td className ="name">Debt-To-Equity-Ratio</td>
                                    <td className={debtToEquityRatio > 2 ? 'danger' : debtToEquityRatio < 1 ? 'normal' : "warning"} >{debtToEquityRatio.toLocaleString()}</td>
                                </tr>
                                <br></br>
                                <tr className = "dividers">
                                    <td className ="name"> <b>Profitability</b> </td>
                                    <td className = "debits" ></td>
                                </tr>
                                <tr>
                                    <td className ="name">Return on Assets</td>
                                    <td className={returnOnAssets < 0.05 ? 'danger' : returnOnAssets < .2 ? 'warning' : "normal"} >{returnOnAssets.toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td className ="name">Gross Profit Margin</td>
                                    <td className={grossProfitMargin < .5 ? 'danger' : grossProfitMargin < .7 ? 'warning' : "normal"} >{grossProfitMargin.toLocaleString()}</td>
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