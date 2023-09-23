import './App.css'
import UserList from "./components/UserList"
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom'
import CreateNewUser from './pages/CreateNewUser'
import HomePage from './pages/HomePage'
import AdminPage from './pages/AdminPage'



function App() {

  return (
    <BrowserRouter>
      <main>
        <Routes>
          <Route path='' element={<HomePage/>}/>
                  <Route path='newuser' element={<CreateNewUser />} />
                  <Route path='adminpage' element={<AdminPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  )

}

export default App
