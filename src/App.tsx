import './App.css'
import UserList from "./components/UserList"
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom'
import CreateNewUser from './pages/CreateNewUser'
import HomePage from './pages/HomePage'
import AdminPage from './pages/AdminPage'
import AdminPasswordPage from './pages/AdminPasswordPage'
import AdminUsersPage from './pages/AdminUsersPage'
import AdminVerificationPage from './pages/AdminVerificationPage'
import Header from './components/Header'



function App() {

  return (
    <BrowserRouter>
      <main>
        <Routes>
            <Route path='' element={<HomePage/>}/>
            <Route path='newuser' element={<CreateNewUser />} />
            <Route path='admin' element={<AdminPage />} />
            <Route path='admin/passwords' element={<AdminPasswordPage />} />
            <Route path='admin/users' element={<AdminUsersPage />} />
            <Route path='admin/verification' element={<AdminVerificationPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  )

}

export default App
