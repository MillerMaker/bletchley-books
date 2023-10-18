
import Header from '../components/Header'
import { useNavigate, useLocation} from 'react-router'
import AccountInfo from '../components/AccountInfo'




function ViewAccount() {
    const navigate = useNavigate();

    const {state} = useLocation();
    const id = state;

    console.log("ViewAccountsSaysHi")
    return (
        <>
            <Header title="View Account" homePath="/private-outlet/chart-of-accounts" />
            <AccountInfo backPath = "/private-outlet/chart-of-accounts" toView = {state} />
        </>
    )

}

export default ViewAccount