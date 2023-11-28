import Header from "../components/Header";
import FinancialRatios from "../components/FinancialRatios"
import FinancialStatements from "../components/FinancialStatements";
import PendingJournals from "../components/PendingJournals";
import { useState } from "react";
import { GetAuthUserDoc } from "../firebase";
import PendingUsers from "../components/PendingUsers";

function Dashboard() {

    const [userRole, setUserRole] = useState("");
    const [requestedRole, setRequestedRole] = useState(false);


    if (!requestedRole) getRole();
    async function getRole() {
        setRequestedRole(true);
        const authUserDoc = await GetAuthUserDoc();

        if (authUserDoc == "null" || authUserDoc == "multipleUsers" || authUserDoc == "notFound") return "noUser";
        setUserRole(authUserDoc.data().role);
    }




    return (
        <>
            <Header homePath="/private-outlet/dashboard" title="Dashboard"  />
            <h3 style={{ textAlign: "center", padding: "30px" }} >Dashboard</h3>
            <div style={{ display: "flex" }}>
                <FinancialRatios></FinancialRatios>
                <PendingJournals></PendingJournals>
                {userRole == "admin" && <PendingUsers></PendingUsers>}
            </div>

            
        </>
    )
}
export default Dashboard;