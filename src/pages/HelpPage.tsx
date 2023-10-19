
import Header from '../components/Header'
import { useNavigate, useLocation} from 'react-router'
import Help from '../components/Help'






function HelpPage() {
    const navigate = useNavigate();

    const {state} = useLocation();
    const backPath = state;

    console.log("ViewAccountsSaysHi")
    return (
        <>
            <Header title="Help Page" homePath= {backPath} />
            <Help backPath = {backPath}/>
        </>
    )

}

export default HelpPage