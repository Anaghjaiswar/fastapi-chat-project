import './App.css'
import ChatPage from './components/chats/ChatPage';
// import LeftPane from './components/chats/LeftPane';
// import MiddlePane from './components/chats/MiddlePane';
// import RightPane from './components/chats/RightPane';
// import Sendmail from './components/email-verification/Sendmail';
// import VerifyEmail from './components/email-verification/VerifyEmail';
import Login from './components/login-page/LoginPage'
// import Register from './components/register-page/RegisterPage'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RequireAuth from './context/RequireAuth';
import Auth from './components/auth/auth';



function App() {

  return (
    <>
      <Router>
        <Routes>
          {/* <Route path="/" element={<Sendmail/>}></Route> */}
          {/* <Route path="/verify-email" element={<VerifyEmail/>}></Route> */}
          <Route path="/login" element = {<Login/>}></Route>
          {/* <Route path="/register" element={<Register />}></Route> */}
          <Route path="/auth" element={<Auth/>}></Route>

          <Route element={<RequireAuth/>}>

            <Route path="/chat" element={<ChatPage/>}></Route>
          </Route>
        </Routes>
      </Router>
    </>
  );
};

export default App
