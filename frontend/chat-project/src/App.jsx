import './App.css'
import ChatPage from './components/chats/ChatPage';
import Login from './components/login-page/LoginPage'
import Auth from './components/auth/Auth';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RequireAuth from './context/RequireAuth';


function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element = {<Login/>}></Route>
          <Route path="/auth" element={<Auth/>}></Route>
            <Route path="/chat" element={<ChatPage/>}></Route>

          {/* <Route element={<RequireAuth/>}>

          </Route> */}
        </Routes>
      </Router>
    </>
  );
};

export default App
