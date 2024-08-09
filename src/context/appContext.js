import React, { createContext, useContext, useReducer } from "react";
import reducer from "./reducers";
import { axiosObj } from "../utils/axios";

import {
  LOGIN_START,
  LOGIN_SUCCESS,
  LOGIN_FAILED,
  LOGOUT_USER,
  SIGNUP_START,
  SIGNUP_SUCCESS,
  SIGNUP_FAILED,
  NEW_ANNOUNCEMENT_ADDED,
  UPDATE_USER_START,
  UPDATE_USER_SUCCESS,
  UPDATE_USER_FAILED,
  ADD_CONVERSATION_NAME,
  SELECTED_SEARCHED_MESSAGE,
  ADD_CONVERSATION_NAMES,
  SHOW_LOGOUT_FROM_OTHER_DEVICES ,
  CLOSE_LOGOUT_FROM_OTHER_DEVICES
} from "./actions";
import socket from "../socketConfig";


const user = localStorage.getItem("user");
const token = localStorage.getItem("token");


const initialState = {
  user: user ? JSON.parse(user) : null,
  token: token ? token : null,
  loading: false,
  error: null,
  isAdmin: false,
  isAnnouncing: false,
  newAnnouncement: false,
  conversationNames: {},
  selectedSearchedMessage: {},
  showLogoutFromOtherDevicesModal : false
};


const AppContext = React.createContext();


const AppProvider = ({ children }) => {

  const [state, dispatch] = useReducer(reducer, initialState);

  const login = async ({ username, password }) => {
    
    dispatch({ type: LOGIN_START });

    try {
      const respone = await axiosObj.post("/auth/signin", {
        username,
        password,
      });

      const { user, token, isAdmin, isAnnouncing } = respone.data;

      //console.log(respone.data);

      if(user.isOnline){
        showLogoutModal()
      }else{
        //console.log("logologlolgoogloog");
        await socket.emit("addUser", {
          userId: user._id,
          token: user.isAdmin ? `admin ${token}` : `Bearer ${token}`,
          timestamp: Date.now(),
        });
      }

      dispatch({
        type: LOGIN_SUCCESS,
        payload: { user, token, isAdmin, isAnnouncing },
      });

      setUpLocalstorage({ user, token });

    } catch (error) {
      dispatch({
        type: LOGIN_FAILED,
        payload: { msg: error.response.data.msg },
      });
    }
  };

  
  const signUp = async ({ username, email, password, cpassword }) => {
    dispatch({ type: SIGNUP_START });

    try {
      const response = await axiosObj.post("/auth/signup", {
        username,
        email,
        password,
        cpassword,
      });

      const { user } = response.data;

      dispatch({ type: SIGNUP_SUCCESS, payload: { user } });
    } catch (error) {
      dispatch({
        type: SIGNUP_FAILED,
        payload: { msg: error.response.data.msg },
      });
    }
  };

  const setUpLocalstorage = ({ user, token }) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    dispatch({ type: UPDATE_USER_SUCCESS, payload: user });
  };



  const addConversationName = ({ name, _id, isUnread , isOnline }) => {
    dispatch({ type: ADD_CONVERSATION_NAME, payload: { name, _id, isUnread , isOnline } });
  };    



  const addConversationNames = (convs) => {
    dispatch({ type: ADD_CONVERSATION_NAMES, payload: convs });
  };



  const removeLocalstorage = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const logoutUser = () => {
    dispatch({ type: LOGOUT_USER });
    removeLocalstorage();
    window.location.reload();
  };


  const showLogoutModal = () => {
    dispatch({type : SHOW_LOGOUT_FROM_OTHER_DEVICES})
  }
 
  const hideLogoutModal = () => {
    dispatch({type : CLOSE_LOGOUT_FROM_OTHER_DEVICES})
  }

  const newAnnouncementAddedFun = () => {
    dispatch({ type: NEW_ANNOUNCEMENT_ADDED });
  };

  const setSelectedSearchedMessage = ({
    conversationId,
    messageId,
    isMessage,
    isGroup,
    members,
  }) => {
    dispatch({
      type: SELECTED_SEARCHED_MESSAGE,
      payload: { conversationId, messageId, isMessage, isGroup, members },
    });
  };
  //   const updateUser = async ({ username, email, password }) => {
  //     dispatch({ type: UPDATE_USER_START });

  //     try {
  //       const response = await axiosObj.post(
  //         `/auth/updateUserProfile/${JSON.parse(user._id)}`,
  //         {
  //           username,
  //           email,
  //           password,
  //         },
  //         {
  //           headers: {
  //             token_header: `Bearer ${token}`,
  //           },
  //         }
  //       );

  //       ////console.log(response.data);

  //       dispatch({ type: UPDATE_USER_SUCCESS, payload: response.data });
  //     } catch (error) {
  //       if (!error.response.data.success) {
  //         dispatch({
  //           type: UPDATE_USER_FAILED,
  //           payload: { msg: error.response.data.msg },
  //         });
  //       }
  //     }
  //   };


  
  return (
    <AppContext.Provider
      value={{
        ...state,
        login,
        signUp,
        logoutUser,
        newAnnouncementAddedFun,
        setUpLocalstorage,
        addConversationName,
        setSelectedSearchedMessage,
        addConversationNames,
        showLogoutModal,
        hideLogoutModal ,
        dispatch
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// custom hook to access any state context key
const useAppContext = () => {
  return useContext(AppContext);
};

export { AppProvider, initialState, useAppContext };
