import './App.css'
import Login from './components/login-page/LoginPage'
import Register from './components/register-page/RegisterPage'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element = {<Login/>}></Route>
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
    </>
  );
};

export default App
