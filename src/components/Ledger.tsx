import backButton from "../assets/back_arrow_icon.png";
import { Timestamp, getDocs, collection, where, query, FieldPath} from 'firebase/firestore';
import { TimeStampToDateString, db} from '../firebase';
import { useState } from 'react';
import { useNavigate } from "react-router"


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

    //navigate, obviously. 
    const navigate = useNavigate();
    //Get Account Doc from Props
    
    async function GetData() {
        /* REQUEST DATA ONCE */
        setRequestedData(true);

        //get Account Data
        setAccountDoc(props.toView.data); 
        console.log( props.toView.data.journals); 

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
            <table className="table table-bordered table-hover">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Debit</th>
                        <th>Credit</th>
                        <th>Balance</th>

                    </tr>
                </thead>
                <tbody>
                    {journalDocs.map((journalDoc: { id: string, data: any }, index: number) =>
                    (/*MatchesSearch(accountDoc) &&*/
                        <>
                            <tr
                                className={"" + (selectedIndex == index && "table-primary")}
                                key={journalDoc.id}
                                onClick={() => setSelectedIndex(index)}>
                                <td>{TimeStampToDateString(journalDoc.data.date)}</td>
                                <td> {}</td>
                                <td> {journalDoc.data.transactions.map(((infoObj: { id: string, credit: number, debit: number }, index: number) => { 
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
                                <td> {journalDoc.data.transactions.map(((infoObj: { id: string, credit: number, debit: number }, index: number) => { 
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
                                <td>BALANCE GOES HERE</td>
                            </tr>
                            {journalDocs.map((doc: { id: string, data: any }, index: number) => (<tr></tr>)) /* Make new Rows for each transaction in the journal entry */}
                        </>
                    )
                    )}
                </tbody>
            </table>
            </div>
        </div>
        </>
    )

    async function getAccount() {
        if(!gottenDoc) {
            setAccountDoc(props.toView.data); 
            setGottenDoc(true); 
        }
    }
}

export default Ledger; 
