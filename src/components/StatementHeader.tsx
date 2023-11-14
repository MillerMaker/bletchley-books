import { getDocs, collection, where, query, Timestamp, } from 'firebase/firestore';
import ReactPDF, { Page, Text, View, Document, StyleSheet, PDFViewer, renderToStream, renderToBuffer } from '@react-pdf/renderer';
import { useNavigate, useLocation } from "react-router"
import React, { useState, useRef, ReactElement } from 'react';
import { useReactToPrint } from 'react-to-print';
import { db, storage } from '../firebase';
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
import EmailUserList from '../components/EmailUserList';
import CustomPopup from '../components/CustomPopup';

import backButton from "../assets/back_arrow_icon.png";
import Header from '../components/Header'
import ReactDOM from 'react-dom';

import "../pages/TrialBalance.css"

interface props {
    body: ReactElement,
    GetDocument: () => JSX.Element
}
function StatementHeader(props: props) {
    /* NAVIGATE & LOCATION */
    const navigate = useNavigate();
    const { state } = useLocation(); //Gets the statement to be displayed

    /* Email Stuff */
    const [emailPopupShown, setEmailPopupShown] = useState(false);
    const [attatchmentURL, setAttatchmentURL] = useState("");


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

    const handleEmail = async () => {

        const blob = await ReactPDF.pdf(props.GetDocument()).toBlob();
        const storageRef = ref(storage, `reports/${state.data.name}.pdf`);
        console.log(blob)
        uploadBytes(storageRef, blob).then(() => {
            getURL();
            console.log("We Uploaded!!!!");
        }).catch((error) => {
            console.error("Error uploading file:", error);
        });


    }

    const getURL = async () => {
        const url = await getDownloadURL(ref(storage, `reports/${state.data.name}.pdf`));
        console.log(url);
        setAttatchmentURL(url);
    }



    return (
        <>
            <div className="Banner">
                <div className="back" onClick={() => navigate('/private-outlet/chart-of-accounts')}>
                    <img src={backButton} className="backIcon" />
                    Back
                </div>
            </div>
            <br></br>
            <div className="trial-balance-document">

                <div className="tools">
                    <svg onClick={() => { handleEmail(); setEmailPopupShown(true) }} xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-envelope" viewBox="0 0 16 16">
                        <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z" />
                    </svg>
                    <svg onClick={handlePrint} xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-printer" viewBox="0 0 16 16">
                        <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z" />
                        <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z" />
                    </svg>
                </div>
                <br></br>

                <div ref={componentRef}>

                    {props.body}

                </div>
            </div>

            {emailPopupShown &&
                <CustomPopup child={
                    <>
                        <EmailUserList hasAttatchment={true} AdditionalText={attatchmentURL} />
                        <button className="btn btn-primary btn-danger" onClick={() => { setEmailPopupShown(false) }}>Cancel</button>
                    </>
                } />
            }

        </>
    );
}

export default StatementHeader