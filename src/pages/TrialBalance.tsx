import { getDocs, collection, where, query, Timestamp,} from 'firebase/firestore';
import ReactPDF, { Page, Text, View, Document, StyleSheet,  PDFViewer ,renderToStream, renderToBuffer} from '@react-pdf/renderer';
import { useNavigate, useLocation } from "react-router"
import React, { useState, useRef } from 'react';
import {useReactToPrint} from 'react-to-print';
import { db, storage} from '../firebase';
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";

import backButton from "../assets/back_arrow_icon.png";
import Header from '../components/Header'
import ReactDOM from 'react-dom';

import "./TrialBalance.css"

function TrialBalance() {
    /*GET DATA BOOL */
    const [requestedData, setRequestedData] = useState(false);
    
    /* ACCOUNT DOCS */
    const [accountDocs, setAccountDocs] = useState(Array<{ id: string, data: any }>);

    /* NAVIGATE & LOCATION */
    const navigate = useNavigate();
    const {state} = useLocation(); //Gets the statement to be displayed

    /* VARIOUS AND SUNDRY POPUPS */
    const [emailPopupShown, setEmailPopupShown] = useState(false);

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
            if (t1 <= journalTime && t2 >= journalTime) {
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


    const componentRef = useRef(null);
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    })



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
    const handleEmail = async () => {
        
        const blob = await ReactPDF.pdf(MyDocument()).toBlob();
        const storageRef = ref(storage, `journalDocuments/${"myFile2.pdf"}`);
        console.log(blob)
        uploadBytes(storageRef, blob).then(() => {
            getURL();
            console.log("We Uploaded!!!!");
        }).catch((error) => {
            console.error("Error uploading file:", error);
        });


    }

    const getURL = async() => {
        const url = await getDownloadURL(ref(storage, 'journalDocuments/myFile2.pdf'));
        console.log(url);
    }

    
    if (!requestedData) {
        GetData();
    }
    /*uncomment this line to see the pdf*/
    //ReactDOM.render(MyDocument(), document.getElementById('root'));
    return (
    <>
        <Header title = "TrialBalance" homePath="/private-outlet/admin" ></Header>
        <div className = "Banner">
            <div className = "back"  onClick={() => navigate('/private-outlet/chart-of-accounts')}>
                <img src = {backButton} className = "backIcon"/>
                Back
            </div>
        </div>
        <br></br>
        <div className = "trial-balance-document">
            <div className ="tools">
            <svg onClick={handleEmail} xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-envelope" viewBox="0 0 16 16">
                <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/>
            </svg>
            <svg onClick = {handlePrint} xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className ="bi bi-printer" viewBox="0 0 16 16">
            <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/>
            <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z"/>
            </svg>
            </div>
             <br></br>
            <div ref = {componentRef}>
                <div className = "main">
                    <h4> Trial Balance </h4>
                    <h6> As At November 13, 2023</h6>
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

export default TrialBalance