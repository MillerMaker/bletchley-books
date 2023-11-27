import { getDocs, collection, where, query, Timestamp,} from 'firebase/firestore';
import ReactPDF, { Page, Text, View, Document, StyleSheet,  PDFViewer ,renderToStream, renderToBuffer} from '@react-pdf/renderer';
import { useNavigate, useLocation } from "react-router"
import React, { useState, useRef } from 'react';
import {useReactToPrint} from 'react-to-print';
import { TimeStampToDateString, db, storage} from '../firebase';
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
import EmailUserList from '../components/EmailUserList';
import CustomPopup from '../components/CustomPopup';

import backButton from "../assets/back_arrow_icon.png";
import Header from '../components/Header'
import ReactDOM from 'react-dom';

import "./TrialBalance.css"
import StatementHeader from '../components/StatementHeader';

function TrialBalance() {
    /*GET DATA BOOL */
    const [requestedData, setRequestedData] = useState(false);
    
    /* ACCOUNT DOCS */
    const [accountDocs, setAccountDocs] = useState(Array<{ id: string, data: any }>);

    /* NAVIGATE & LOCATION */
    const {state} = useLocation(); //Gets the statement to be displayed


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

        journalQuery.forEach((journalDoc) => {
            //console.log(state.data.startDate);
            const t1 = new Timestamp(state.data.startDate.seconds, state.data.startDate.nanoseconds).toDate().getTime(); 
            const t2 = new Timestamp(state.data.endDate.seconds, state.data.endDate.nanoseconds).toDate().getTime(); 
            const journalTime = journalDoc.data().date.toDate().getTime();
            //check if journal entry is within specified date range. 
            if (t1 <= journalTime && t2 >= journalTime && journalDoc.data().status == "approved") {
                const transactions = journalDoc.data().transactions;
                //for each transaction, get the associated account, and add the credits and debits
                transactions.map(((trans: { id: string, credit: number, debit: number }) => { 
                    let i = accountDocs.findIndex((infoObj: {id: string, data: any}) => infoObj.id == trans.id);
                    accountDocs[i].data.credit = accountDocs[i].data.credit + trans.credit;
                    accountDocs[i].data.debit = accountDocs[i].data.debit + trans.debit;
                }));
            }
        })
        setAccountDocs(accountDocs);

    }


    const styles = StyleSheet.create({
        header: {
          flexDirection: 'column',
          marginRight: 'auto',
          marginLeft: 'auto',
        },
        page: {
          flexDirection: 'row',
          fontSize: 15,
          marginRight: 'auto',
          marginLeft: 'auto',
        },
        debits: {
          fontSize: 12,
          margin: 10,
          paddingLeft: 300,
          textAlign: 'right',
        },
        credits: {
            fontSize: 12,
            margin: 10,
            paddingLeft: 10,
            flexGrow: 10,
            textAlign: 'right',
          }
      });

    const MyDocument = () => (
            <Document>
                <Page size = "A4">
                    <View style = {styles.header}>  
                    <Text> Trial Balance </Text>
                    <Text style={{fontSize: 10,margin: 5,}}> As of November 19 </Text>
                    </View>
                    <View style = {styles.page}>
                        <View style={{fontSize: 12, margin: 10,}}>
                            <Text> </Text>
                            {accountDocs.map((doc,index) => (
                                <Text>{doc.data.name}</Text>
                            ))}
                            <Text>Total</Text>
                        </View>
                        <View style = {styles.debits}>
                            <Text>Debits</Text>
                            {accountDocs.map((doc,index) => (
                                <Text>{doc.data.debit.toLocaleString()}</Text>
                            ))}
                            <Text>{calculateDebits().toLocaleString()}</Text>
                        </View>
                        <View style = {styles.credits}>
                            <Text>Credits</Text>
                            {accountDocs.map((doc,index) => (
                                <Text>{doc.data.credit.toLocaleString()}</Text>
                            ))}
                            <Text>{calculateCredits().toLocaleString()}</Text>
                        </View>
                    </View>
                </Page>
            </Document>
    )


    
    if (!requestedData) {
        GetData();
    }
    /*uncomment this line to see the pdf*/
    //ReactDOM.render(MyDocument(), document.getElementById('root'));
    return (
    <>
            <Header title="TrialBalance" homePath="/private-outlet/admin" ></Header>
            <StatementHeader GetDocument={MyDocument}
                body={<> 
                <div className = "main">
                <h4>{state.data.name}</h4>
                <h6> Trial Balance Statement</h6>
                <h6>{TimeStampToDateString(state.data.startDate)} to {TimeStampToDateString(state.data.endDate)}</h6>
                </div>
                <div className = "table-div">
                    <table className = "trial-balance-table">
                        <br></br>
                            <tr className ="dividers">
                                <th></th>
                                <th>Debits</th>
                                <th>Credits</th>
                            </tr>
                            {accountDocs.map((doc, index) => (
                                <tr className = "dividers">
                                <td className ="name">{doc.data.name}</td>
                                <td className = "debits" >{doc.data.debit.toLocaleString()}</td>
                                <td>{doc.data.credit.toLocaleString()}</td>
                                </tr>
                            ))}
                            <tr>
                                <td className="name"> <b>Total</b></td>
                                <td><b>{calculateDebits().toLocaleString()}</b></td>
                                <td><b>{calculateCredits().toLocaleString()}</b></td>
                            </tr>
                    </table>
                </div>
            </>} />
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

export default TrialBalance