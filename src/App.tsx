import './App.css'
import { BrowserRouter, Route, Routes, Outlet, Navigate} from 'react-router-dom'
import CreateNewUser from './pages/CreateNewUser'
import HomePage from './pages/HomePage'
import AdminPage from './pages/AdminPage'
import AdminPasswordPage from './pages/AdminPasswordPage'
import AdminUsersPage from './pages/AdminUsersPage'
import AdminVerificationPage from './pages/AdminVerificationPage'
import Dashboard from './pages/Dashboard'
import React, { useState } from 'react';
import { getAuth, onAuthStateChanged} from "firebase/auth"
import PasswordChangePage from './pages/PasswordResetPage'
import ChartAccountsPage from './pages/ChartAccountsPage'
import ViewAccount from './pages/ViewAccount'

const auth = getAuth();

function PrivateOutlet() {
  return auth.currentUser ? <Outlet /> : <Navigate to='../'/>;
}

function App() {
const [token, setToken] = useState();

  return (
    <BrowserRouter>
      <main>
      <Routes>
        <Route path = '' element = {<HomePage/>} />
        <Route path='newuser' element={<CreateNewUser/>} />
        <Route path = 'private-outlet' element = {<PrivateOutlet />}>
            <Route path='admin' element={<AdminPage />} />
            <Route path='admin/passwords' element={<AdminPasswordPage />} />
            <Route path='admin/users' element={<AdminUsersPage />} />
            <Route path='admin/verification' element={<AdminVerificationPage />} />
            <Route path='dashboard' element={<Dashboard />} />
            <Route path='password-change' element={<PasswordChangePage />} />
            <Route path='chart-of-accounts' element={<ChartAccountsPage />} />
            <Route path='view-account' element={<ViewAccount/>} />
        </Route>
      </Routes>
      </main>
    </BrowserRouter>
  ) 
}

export default App