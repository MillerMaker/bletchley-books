import { DocumentSnapshot, doc, getDoc , DocumentData,Timestamp,} from 'firebase/firestore';
import {getDocAt , db, TimeStampToDateString} from '../firebase';
import { useEffect, useState } from 'react';
import backButton from "../assets/back_arrow_icon.png";
import { useNavigate } from "react-router"
import './AccountInfo.css';


interface Props {
    toView: { id: string, data: any };
    backPath: String;
}


function AccountInfo(props: Props) {
    const [accountDoc, setAccountDoc] = useState({
        name: '',
        number: 0,
        credit: 0,
        debit: 0, 
        date: new Timestamp(0,0),
        description: '',
        normalSide: '',
        category: '',
        subcategory:   '',
        initialBalance: 0,
        order: 0,
        statement: '',
        comment: '',
    }); 
    const [gottenDoc, setGottenDoc] = useState(false);
    const navigate = useNavigate();
    
    getAccount(); 
    return <>
        <div className = "Page">
        <div className = "Banner">
            <div className = "back"  onClick={() => navigate('/private-outlet/chart-of-accounts')}>
                <img src = {backButton} className = "backIcon"/>
                Back
            </div>
            <div className ="account-name">
                {accountDoc.number + "\u00A0\u00A0"  + accountDoc.name}
            </div>
            <div className = "normal-side">
                {accountDoc.normalSide}
            </div>
        </div>
        <div className = "main-info">
            <div className ="details">
                <div className = "category">
                    {"Category: \u00A0\u00A0"+ accountDoc.category}
                        <div className ="subcategory">
                            {"Subcategory: \u00A0\u00A0"+ accountDoc.subcategory}
                        </div>  
                </div>
                <div className = "description">
                    Description: 
                        <div className ="description-text">
                            {accountDoc.description}
                        </div>  
                </div>
                <div>
                    Financial Statement: 
                    <div className = "financial-statements">
                        {accountDoc.statement}
                    </div>
                </div>
                <div className = "created-info">
                    {"Created by: " }
                    <br></br>
                    {"Created on: " + TimeStampToDateString(accountDoc.date)}
                    <br></br>
                    {"Comment:  " + accountDoc.comment }
                </div>

            </div>
            <div className = "current-balance">
                <div>
                {accountDoc.normalSide =='credit' ?  "Current Balance: " 
                + (accountDoc.initialBalance + accountDoc.credit - accountDoc.debit): "Current Balance: " 
                + (accountDoc.initialBalance + accountDoc.debit-accountDoc.credit)}
                </div>

            </div>

        </div>

        </div>
        </>;


    async function getAccount() {
        if(!gottenDoc) {
            setAccountDoc(props.toView.data); 
            setGottenDoc(true); 
        }
    }
}


export default AccountInfo;