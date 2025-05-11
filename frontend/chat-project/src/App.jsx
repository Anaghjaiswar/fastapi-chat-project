import './App.css'
import LeftPane from './components/chats/LeftPane';
import RightPane from './components/chats/RightPane';
import Login from './components/login-page/LoginPage'
import Register from './components/register-page/RegisterPage'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element = {<Login/>}></Route>
          <Route path="/register" element={<Register />}></Route>
          <Route path="/leftpane" element={<LeftPane/>}></Route>
          <Route path="/rightpane" element={<RightPane/>}></Route>
        </Routes>
      </Router>
    </>
  );
};

export default App
