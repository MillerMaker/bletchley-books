import './App.css'
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom'
import CreateNewUser from './pages/CreateNewUser'
import HomePage from './pages/HomePage'
import Dashboard from './pages/Dashboard'


function App() {

  return (
    <BrowserRouter>
      <main>
        <Routes>
          <Route path='' element={<HomePage/>}/>
          <Route path='newuser' element={<CreateNewUser/>}/>
          <Route path='Dashboard' element={<Dashboard/>}/>
        </Routes>
      </main>
    </BrowserRouter>
  )

}

export default App
