import { useState } from "react";
import CustomPopup from "./CustomPopup";




interface Props {
    popupText: string
    roleChosenCallback: (role: string) => void
    backPressedCallback: () => void
}

function RolePopup(props: Props) {

    const [selectedRole, setSelectedRole] = useState("accountant");


    return <>
        <CustomPopup child={<>
            <h3>{props.popupText}</h3>
            <br></br><br></br>
            <select
                className="form-select"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}>
                <option value="accountant">Accontant</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
            </select>
            <br></br><br></br><br></br>
            <div className="btn-group">
                <button
                    onClick={() => props.roleChosenCallback(selectedRole)}
                    className="btn btn-primary"
                >
                    Change
                </button>
                <button
                    onClick={props.backPressedCallback}
                    className="btn btn-secondary">
                    Back
                </button>
            </div></>} />
    </>;
}

export default RolePopup;