import { useState } from 'react'

interface Props {
    documentData: string;
}

function EventLogTable(props: Props) {
    const [documentType, setDocumentType] = useState("none");
    const [JSONdata, setJSONdata] = useState();
    const [checkDocument, setCheckDocument] = useState(false);

    function getDocumentType() {
        if(props.documentData.includes("category")){
            setDocumentType("account");
        }
        if(props.documentData.includes("address")){
            setDocumentType("user");
        }
    }

    function getDocumentJSON(){
        setJSONdata(JSON.parse(props.documentData));
        console.log(JSONdata);
    }

    if(checkDocument){
        getDocumentType();
        getDocumentJSON();
        setCheckDocument(false);
    }

  return (
    <>
    </>
  )
}

export default EventLogTable