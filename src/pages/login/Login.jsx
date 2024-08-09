import React, { useEffect, useState } from "react";
// import "./login.scss";
import { Link, useNavigate } from "react-router-dom";
import { axiosObj } from "../../utils/axios";
import { useAppContext } from "../../context/appContext";
import loginSvg from "../../assets/images/ArtboardSmallBackground.svg";
import logo from "../../assets/images/Artboard.svg";
import { toast } from "react-toastify";
import LogOutFromOtherDevices from "../../components/LogoutFromOtherDevices";

const Login = () => {

  const toastOptions = {
    position: "top-center",
    autoClose: 2000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };
  
  const { login, addConversationNames, user, token, error, loading , showLogoutFromOtherDevicesModal } = useAppContext();

  const navigate = useNavigate();

  ///////////////////////////////////////////// fetch initial unread conversations same as in App.js component
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
        };
      });

      //console.log(convNames);
      addConversationNames(convNames);
    } catch (error) {
      // ////console.log(error);
    }
  };


  useEffect(() => {
    if (user && !user.isOnline) {

      navigate("/");
  ///////////////////////////////////////////// fetch initial unread conversations same as in App.js component
    
    getUserConversation();
    
    }
  }, [user]);


  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const { username, password } = formData;

  const onChange = (e) => {
    if(!/\s/.test(e.target.value.trim())){
      setFormData({ ...formData, [e.target.name]: e.target.value});
    }
  };

  const onSubmit = (e) => {

    e.preventDefault();

    if(username.trim() !== username) return toast.error("white spaces not allowed" , toastOptions)

    login({ username, password });
  };



  return (
    <div className="login">
      <div className="login-user-svg-logo-container">
        <img src={logo} alt="" />
      </div>

      <div className="login-user-svg-container">
        <img src={loginSvg} alt="" className="user-login-svg" />
      </div>

      <h1 className="loginHeader">Login</h1>

      <form onSubmit={onSubmit} className="loginForm">
        <input
          className="loginInputField"
          onChange={onChange}
          type="text"
          placeholder="username"
          name="username"
        />
        <input
          className="loginInputField"
          onChange={onChange}
          type="password"
          placeholder="****"
          name="password"
        />

        <button disabled={loading} className="loginBtn">
          {loading ? "loading ..." : "Login"}
        </button>
      </form>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "5px",
          marginTop: "25px",
        }}
      >
        <p style={{ fontSize: "16px " }}>Don't have an account ?</p>
        <Link
          style={{ textDecoration: "none", fontSize: "16px" }}
          to="/sign-up"
        >
          register
        </Link>
      </div>

      {error && (
        <p
          style={{
            color: "red",
            fontSize: "30px",
            marginTop: "10px",
            textAlign: "center",
          }}
        >
          {error}
        </p>
      )}  

      {/* {console.log(showLogoutFromOtherDevicesModal)} */}

      {showLogoutFromOtherDevicesModal && <LogOutFromOtherDevices/>}
    
    </div>

  );
};

export default Login;
