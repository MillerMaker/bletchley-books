import UserList from '../components/UserList'
import Header from '../components/Header'

function HomePage() {
    return (
        <>
            <Header title="Admin Home" homePath="/admin" />
            <br></br>
            <button className="btn btn-lg btn-block btn-secondary"
                onClick={() => location.href="/admin/users"}>
                User Management</button><br /><br />
            <button className="btn btn-lg btn-block btn-secondary"
                onClick={() => location.href = "/admin/verification"}>
                User Verification</button><br /><br />
            <button className="btn btn-lg btn-block btn-secondary"
                onClick={() => location.href = "/admin/passwords"}>
                Password Report</button><br /><br />

        </>
    )

}

export default HomePage