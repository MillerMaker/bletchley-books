import { useState } from 'react'

interface Props {
    documentData: string;
}

function EventLogTable(props: Props) {
    const [documentType, setDocumentType] = useState("none");
    const [JSONdata, setJSONdata] = useState(Array<string>);
    const [checkDocument, setCheckDocument] = useState(true);

    function getDocumentType() {
        if(props.documentData.includes("category")){
            setDocumentType("account");
        }
        if(props.documentData.includes("address")){
            setDocumentType("user");
        }
    }

    if(checkDocument){
        getDocumentType();
        getDocumentJSON();
        setJSONdata(getDocArray());
        setCheckDocument(false);
    }

    function getDocumentJSON(){
        setJSONdata(JSON.parse(props.documentData));
        console.log(JSONdata);
    }

    function getDocArray(): Array<string> {
        var obj = JSON.parse(props.documentData);
        var array: Array<string> = new Array<string>;
             
        for(var i in obj){
            array.push(obj[i]);
        }

        console.log(array);

        return array;
    }

  return (
    <>
        {documentType == "account" && JSONdata != undefined &&
        <>
            <h3>Account Document</h3>
            <table className="table table-bordered table-hover">
                <tr>
                    <td>
                        Number
                    </td>
                    <td>
                        {JSONdata[0]}
                    </td>
                </tr>
                <tr>
                    <td>
                        Name
                    </td>
                    <td>
                        {JSONdata[1]}
                    </td>
                </tr>
                <tr>
                    <td>
                        Category
                    </td>
                    <td>
                        {JSONdata[4]}
                    </td>
                </tr>
                <tr>
                    <td>
                        Subcategory
                    </td>
                    <td>
                        {JSONdata[5]}
                    </td>
                </tr>
                <tr>
                    <td>
                        Balance
                    </td>
                    <td>
                        {JSONdata[6]}
                    </td>
                </tr>
                <tr>
                    <td>
                        Financial Statement
                    </td>
                    <td>
                        {JSONdata[8]}
                    </td>
                </tr>
            </table>
        </>
        }
        {documentType == "user" &&
        <>
            <h3>User Document</h3>
            <table className="table table-bordered table-hover">
                <tr>
                    <td>
                        First Name
                    </td>
                    <td>
                        {JSONdata[4]}
                    </td>
                </tr>
                <tr>
                    <td>
                        Last Name
                    </td>
                    <td>
                        {JSONdata[5]}
                    </td>
                </tr>
                <tr>
                    <td>
                        Role
                    </td>
                    <td>
                        {JSONdata[6]}
                    </td>
                </tr>
                <tr>
                    <td>
                        Email
                    </td>
                    <td>
                        {JSONdata[9]}
                    </td>
                </tr>
                <tr>
                    <td>
                        Address
                    </td>
                    <td>
                        {JSONdata[1]}
                    </td>
                </tr>
            </table>
        </>
        }
        {documentType == "none" &&
            <p>Error: Unknown Document Type</p>
        }
    </>
  )
}

export default EventLogTable