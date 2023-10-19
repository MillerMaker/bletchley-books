import { useState }from 'react'
import { Timestamp, getDocs, query, collection } from 'firebase/firestore';
import { TimeStampToDateString, db } from '../firebase';
import CustomPopup from './CustomPopup';
import { json } from 'react-router-dom';

export class EventData {
    userID: string;
    eventDateTime: Timestamp;
    eventDocument: any;

    constructor(userID: string, eventDateTime: Timestamp, eventData: any){
        this.userID = userID;
        this.eventDateTime = eventDateTime;
        this.eventDocument = eventData;
    }
}

function EventLog() {
    const [eventDocs, setEventDocs] = useState(Array<EventData>);
    const [requestedData, setRequestedData] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [viewDocPopupShown, setViewDocPopupShown] = useState(false);

    async function getEventData() {
        if(requestedData)
            return;
        setRequestedData(true);

        const queryResults = await getDocs(query(collection(db, "event-log")));
        let queriedEventDocs: Array<EventData> = new Array();
        queryResults.forEach((docSnapshot) => {
            queriedEventDocs.push(new EventData(docSnapshot.data().userID, docSnapshot.data().eventDateTime, docSnapshot.data().document));
        });
        setEventDocs(queriedEventDocs);
    }

    if(eventDocs.length == 0){
        getEventData();
    }

  return (
    <>
    {eventDocs.length == 0 && <p>NO EVENTS</p>}
    <table className='table table-bordered table-hover'>
        <thead>
            <tr>
                <th>UserID</th>
                <th>Event Date</th>
                <th>Document</th>
            </tr>
        </thead>
        <tbody>
            {eventDocs.map((eventDoc: EventData, index: number) => 
                <tr 
                className={"" + (selectedIndex == index && "table-primary")}
                key={eventDoc.userID}
                onClick={() => setSelectedIndex(index)}
                >
                    <td>{eventDoc.userID}</td>
                    <td>{TimeStampToDateString(eventDoc.eventDateTime)}</td>
                    <td><button onClick={() => {setViewDocPopupShown(true)}}>View</button></td>
                </tr>
            )}
        </tbody>
    </table>
    </>
  )
}

export default EventLog