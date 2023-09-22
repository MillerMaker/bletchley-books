import './App.css'
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom'
import CreateNewUser from './pages/CreateNewUser'
import HomePage from './pages/HomePage'


function App() {

  return (
    <BrowserRouter>
      <main>
        <Routes>
          <Route path='' element={<HomePage/>}/>
          <Route path='newuser' element={<CreateNewUser/>}/>
        </Routes>
      </main>
    </BrowserRouter>
  )

}

export default App
