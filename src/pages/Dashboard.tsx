import Header from "../components/Header";
import FinancialRatios from "../components/FinancialRatios"
import FinancialStatements from "../components/FinancialStatements";

function Dashboard (){
    return (
        <>
            <Header homePath="/private-outlet/dashboard" title="Dashboard"  />
            <h3 style={{textAlign: "center", padding: "30px" }} >Dashboard</h3>
            <FinancialRatios></FinancialRatios>

        </>
    )
}
export default Dashboard;