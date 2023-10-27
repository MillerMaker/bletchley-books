import backButton from "../assets/back_arrow_icon.png";
import { Timestamp } from 'firebase/firestore';
import { useState } from 'react';
import { useNavigate } from "react-router"


interface Props {
    toView: { id: string, data: any };
    backPath: String;
}

function Ledger(props: Props) {
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
    }); 

    const [gottenDoc, setGottenDoc] = useState(false);
    const navigate = useNavigate();
    
    getAccount(); 
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
