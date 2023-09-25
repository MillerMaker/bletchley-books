import './App.css'
import UserList from "./components/UserList"
import { BrowserRouter, Route, Routes, Outlet, Navigate} from 'react-router-dom'
import CreateNewUser from './pages/CreateNewUser'
import HomePage from './pages/HomePage'
import AdminPage from './pages/AdminPage'
import Dashboard from './pages/Dashboard'
import React, { useState } from 'react';

import { getAuth, onAuthStateChanged} from "firebase/auth"

const auth = getAuth();


function PrivateOutlet() {
  console.log(auth.currentUser);
  return auth.currentUser ? <Outlet /> : <Navigate to='../'/>;
}

function App() {
const [token, setToken] = useState();

  return (
    <BrowserRouter>
      <Routes>
        <Route path = '' element = {<HomePage/>} />
        <Route path='newuser' element={<CreateNewUser/>} />
        <Route path = '/private-outlet' element = {<PrivateOutlet />}>
          <Route path='adminpage' element={<AdminPage/>} />
          <Route path='dashboard' element={<Dashboard/>}/> 
        </Route>
      </Routes>
      
    </BrowserRouter>
  ) 
}

export default App
