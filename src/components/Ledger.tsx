import backButton from "../assets/back_arrow_icon.png";
import forwardButton from "../assets/forward_arrow_icon.png"
import { Timestamp, getDocs, collection, where, query, FieldPath} from 'firebase/firestore';
import { TimeStampToDateString, db} from '../firebase';
import { useState } from 'react';
import { useNavigate } from "react-router"
import "./Ledger.css"


interface Props {
    toView: { id: string, data: any };
    backPath: String;
}

function Ledger(props: Props) {
    //selected table index
    const [selectedIndex, setSelectedIndex] = useState(-1);

    //Journal Docs
    const [journalDocs, setJournalDocs] = useState(Array<{ id: string, data: any }>);
    const [requestedData, setRequestedData] = useState(false);
    const [balances, setBalances] =useState([0]);

    //Account information
    const [gottenDoc, setGottenDoc] = useState(false);
    const [accountDoc, setAccountDoc] = useState({
        name: '',
        number: 0,
        credit: 0,
        debit: 0, 
        userID: '',
        date: new Timestamp(0,0),
        description: '',
        normalSide: '',
        category: '',
        subcategory:   '',
        initialBalance: 0,
        order: 0,
        statement: '',
        comment: '',
        journals: []
    }); 

    //current sum of transactions used for displaying balance
    //navigate, obviously. 
    const navigate = useNavigate();

    //Searching State
    const [searchText, setSearchText] = useState("");
    const [searchColumn, setSearchColumn] = useState("balance");

    
    async function GetData() {
        /* REQUEST DATA ONCE */
        setRequestedData(true);

        /* GET ACCOUNT DATA */
        setAccountDoc(props.toView.data); 

        /* GET JOURNAL DATA */
        let q = query(collection(db, "journals"), where('__name__', 'in', props.toView.data.journals));
        let queryResult = await getDocs(q)

        let allJournalDocs: Array<{ id: string, data: any }> = new Array();
        queryResult.forEach((doc) => {
            allJournalDocs.push({ id: doc.id, data: doc.data() });
        })

        setJournalDocs(allJournalDocs);
    }

    if (!requestedData)
        GetData();

    function MatchesSearch(journalDoc: { id: string, data: any }): boolean {
        //Returns Whether or not the accountDoc's
        //  searchColumn field includes the current searchText

        //Special Case for balance as it is not a field in account
        if (searchColumn == "balance") return balances.findLast.toString().toLowerCase().includes(searchText.toLowerCase());

       return journalDoc.data.transactions.map((infoObj: { id: string, credit: number, debit: number }):boolean => {
            if(infoObj.id == props.toView.id) {
                if(infoObj.credit.toString().toLowerCase().includes(searchText.toLowerCase()) || infoObj.debit.toString().toLowerCase().includes(searchText.toLowerCase())) {
                   console.log("true");
                    return true;
                } else {
                    console.log("false");
                    return false
                }
            } else {
                console.log("false");
                return false;
            }           
        });
        return true;
    }
    

    return (
        <>
        <div className = "Page">
        <div className = "Banner">
            <div className = "back"  onClick={() => navigate('/private-outlet/chart-of-accounts')}>
                <img src = {backButton} className = "backIcon"/>
                Back
            </div>
            <div className ="account-name">
                {"Ledger - #" + accountDoc.number + "\u00A0\u00A0"  + accountDoc.name} 
            </div>
            <div className = "normal-side">
                {accountDoc.normalSide}
            </div>
        </div>
        <div className = "transactions">
            <div className = "search-filter">
                <div> 
                    <label>Search by:</label>
                        <select
                            value={searchColumn}
                            onChange={(e) => { setSearchColumn(e.target.value) }}
                        >
                        <option value="debit">Debit</option>
                        <option value="credit">Credit</option>
                        <option value="balance">Balance</option>
                     </select>   
                        <input
                            type="text"
                            value={searchText}
                            onChange={(e) => { setSearchText(e.target.value) }}
                        />
                </div>  
                <div>
                    <label> Filter </label>
                </div>
            </div>

            <table className="table table-bordered table-hover">
                <thead>
                    <tr>      

                    </tr>
                    <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Debit</th>
                        <th>Credit</th>
                        <th>Balance</th>
                        <th>PR</th>
                    </tr>
                </thead>
                <tbody>
                    {searchText == '' &&
                     <tr>
                        <td>Initial Balance</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td>{accountDoc.initialBalance.toFixed(2)}</td>
                    </tr>  
                    }       
                    {journalDocs.map((journalDoc: { id: string, data: any }, index: number) =>
                    (/*MatchesSearch(journalDoc) && */
                        <>
                            <tr
                                className={"" + (selectedIndex == index && "table-primary")}
                                key={journalDoc.id}
                                onClick={() => setSelectedIndex(index)}>
                                <td>{TimeStampToDateString(journalDoc.data.date)}</td>
                                <td> {}</td>
                                <td> {journalDoc.data.transactions.map(((infoObj: { id: string, credit: number, debit: number }) => { 
                                        if (infoObj.id == props.toView.id) {
                                            
                                            return(
                                                <> 
                                                {Number(infoObj.debit).toFixed(2)}
                                                <br></br>
                                                </>
                                            )
                                        } else {
                                            return(
                                            <></>
                                            )
                                        }
                                    }))}
                                </td>
                                <td> {journalDoc.data.transactions.map(((infoObj: { id: string, credit: number, debit: number }) => { 
                                        if (infoObj.id == props.toView.id) {
                                            return(
                                                <> 
                                                {Number(infoObj.credit).toFixed(2)}
                                                <br></br>
                                                </>
                                            )
                                        } else {
                                            return(
                                            <></>
                                            )
                                        }
                                    }))} 
                                </td>
                                <td>{journalDoc.data.transactions.map(((infoObj: { id: string, credit: number, debit: number }) => { 
                                        if (infoObj.id == props.toView.id) {
                                            let balance;
                                            //Don't recalculate this for every page reload
                                                if(accountDoc.normalSide == 'credit') {

                                                    balance = accountDoc.initialBalance + balances[index] + infoObj.credit - infoObj.debit;

                                                    if (balances.length <= index + 1)
                                                    balances.push(balance);

                                                    console.log(balances);
                                                    //setTransactionIndex((transactionIndex)=> transactionIndex + 1);

                                                } else {
                                                    balance = accountDoc.initialBalance + balances[index] + infoObj.debit - infoObj.credit;

                                                    if (balances.length <= index + 1)
                                                    balances.push(balance);

                                                    console.log(balances);
                                                }
                                            return(
                                                <> 
                                                {Number(balance).toFixed(2)}
                                                <br></br>
                                                </>
                                            )
                                        } else {
                                            return(
                                            <></>
                                            )
                                        }
                                    }))} 
                                </td>
                                <td className = "forward-arrow" onClick = {() => navigate('/private-outlet/journal')}>{">"}</td>
                            </tr>
                            {journalDocs.map((doc: { id: string, data: any }, index: number) => (<tr></tr>)) /* Make new Rows for each transaction in the journal entry */}
                        </>
                    )
                    )}   
                    {searchText == '' &&
                    <tr className = "final-row">
                        <td >Final Balance</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td className = "final-balance">{balances[balances.length -1].toFixed(2)}</td>
                    </tr>  
                    }
                </tbody>
            </table>
            </div>
        </div>
        </>
    )
}

export default Ledger; 
