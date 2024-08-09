import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Chat from "./pages/chatPage/Chat";
import Navbar from "./components/navbar/Navbar";
import SignUp from "./pages/signup/SignUp";
import Login from "./pages/login/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import VoiceRecorder from "./components/voiceMsg/VoiceMsg";
import AnnouncementViewModal from "./components/announcementViewModal/AnnouncementViewModal";
import Profile from "./pages/profile/Profile";
import { useEffect } from "react";
import socket from "./socketConfig";
import { useAppContext } from "./context/appContext";
import { axiosObj } from "./utils/axios";
import { LOGIN_SUCCESS } from "./context/actions"
import Contacts from "./pages/contacts/Contacts";


function App() {

  const { logoutUser, addConversationNames, user, token, setUpLocalstorage, dispatch, showLogoutModal } = useAppContext();

  useEffect(() => {

    const getUserByToken = async () => {
      try {
        const response = await axiosObj.get(`/auth/users/singleUser/bytoken`, {
          headers: {
            "token_header": `Bearer ${token}`
          }
        })

        //console.log(response.data);

        setUpLocalstorage({ user: response.data.user, token: response.data.token })
        dispatch({ type: LOGIN_SUCCESS, payload: { user: response.data.user, token: response.data.token, isAdmin: response.data.isAdmin, isAnnouncing: response.data.isAnnouncing } })

        if (response.data.user.isOnline) {
          showLogoutModal()
        } else if (response.data.user && !response.data.user.isOnline) {
          socket.emit("addUser", {
            userId: user._id,
            token: user.isAdmin ? `admin ${token}` : `Bearer ${token}`,
            timestamp: Date.now(),
          });
        }

      } catch (error) {
        //console.log(error);
      }
    }

    if (token) {
      getUserByToken()
    }

  }, [])

  const getUserConversation = async () => {
    try {
      // get all conversations that the current user id inside it , will return a conversation doc obj
      const response = await axiosObj.get(`/conversation/${user._id}`, {
        headers: {
          token_header: `Bearer ${token}`,
        },
      });
      const convNames = response.data.map((conv) => {
        return {
          _id: conv._id,
          isUnread: conv.isUnread,
          isOnline: "offline",
        };
      });

      addConversationNames(convNames);
    } catch (error) {
      //console.log(error);
    }
  };



  useEffect(() => {
    socket.on("logoutUser", (data) => {
      logoutUser();
      window.location.reload();
    });
    getUserConversation();
  }, []);




  return (
    <Router basename="quickn">
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navbar />
              <Chat />
            </ProtectedRoute>
          }
        />

        <Route path="/sign-up" element={<SignUp />} />

        <Route path="/sign-in" element={<Login />} />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Navbar />
              <Profile />
            </ProtectedRoute>
          }
        />
 
        <Route
          path="/contacts"
          element={
            <ProtectedRoute>
              <Navbar />
              <Contacts />
            </ProtectedRoute>
          }
        /> 

      </Routes>

    </Router>
  );
}

export default App;
