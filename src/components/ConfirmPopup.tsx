import { useState } from "react";
import CustomPopup from "./CustomPopup";




interface Props {
    title: string
    confirmCallback: () => void
    backCallback: () => void
}

function ConfirmPopup(props: Props) {
    return <>
        <CustomPopup child={<>
            <h3>{props.title}</h3>
            <br></br>
            <br></br><br></br><br></br>
            <div className="btn-group">
                <button
                    onClick={props.confirmCallback}
                    className="btn btn-primary"
                >
                    Confirm
                </button>
                <button
                    onClick={props.backCallback}
                    className="btn btn-secondary">
                    Back
                </button>
            </div></>} />
    </>;
}

export default ConfirmPopup;