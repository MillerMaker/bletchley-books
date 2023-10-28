import Header from "../components/Header";
import Ledger from "../components/Ledger";
import { useNavigate, useLocation} from 'react-router'




function LedgerPage() {
    const {state} = useLocation();

    return (
        <>
            <Header homePath="/private-outlet/dashboard" title="Dashboard" />
            <Ledger backPath = "/private-outlet/chart-of-accounts" toView = {state} />
        </>
    )

    
}
export default LedgerPage;