import UserList from '../components/UserList'
import Header from '../components/Header'

function AdminUsersPage() {
    return (
        <>
            <Header title="All Users" homePath="/admin" />
            <UserList />
        </>
    )

}

export default AdminUsersPage