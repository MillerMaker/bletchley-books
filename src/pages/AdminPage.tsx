import UserList from '../components/UserList'
import Header from '../components/Header'
import { useNavigate } from 'react-router'



function AdminPage() {
    const navigate = useNavigate();

    return (
        <>
            <Header title="Admin Home" homePath="/private-outlet/admin" />
            <br></br>
            <button className="btn btn-lg btn-block btn-secondary"
                onClick={() => {navigate("/private-outlet/admin/users")}}>
                User Management</button><br /><br />
            <button className="btn btn-lg btn-block btn-secondary"
                onClick={() => {navigate("/private-outlet/admin/verification")}}>
                User Verification</button><br /><br />
            <button className="btn btn-lg btn-block btn-secondary"
                onClick={() => {navigate("/private-outlet/admin/passwords")}}>
                Password Report</button><br /><br />

        </>
    )

}

export default AdminPage