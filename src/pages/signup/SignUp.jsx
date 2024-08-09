import React, { useEffect, useState } from "react";
// import "./signup.scss";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/appContext";
import loginSvg from "../../assets/images/ArtboardSmallBackground.svg";
import logo from "../../assets/images/Artboard.svg";

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    cpassword: "",
  });

  const { loading, error, signUp } = useAppContext();

  const { username, email, password, cpassword } = formData;

  const navigate = useNavigate();

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = (e) => {
    e.preventDefault();

    // if(password !== cpassword) return

    signUp({ username, email, password, cpassword });

    if (!loading) {
      navigate("/sign-in");
    }
  };

  return (
    <>
      <div className="signup">
        <div className="signup-user-svg-logo-container">
          <img src={logo} alt="" />
        </div>

        <h1 className="signupHeader">Sign Up</h1>

        <form onSubmit={onSubmit} className="signupForm">
          <input
            className="signupInputField"
            onChange={onChange}
            type="text"
            placeholder="username"
            name="username"
          />
          <input
            className="signupInputField"
            onChange={onChange}
            type="email"
            placeholder="name@example.com"
            name="email"
          />
          <input
            className="signupInputField"
            onChange={onChange}
            type="password"
            placeholder="********"
            name="password"
          />
          <input
            className="signupInputField"
            onChange={onChange}
            type="password"
            placeholder="********"
            name="cpassword"
          />

          <button disabled={loading} className="signupBtn">
            {loading ? "loading" : "sign up"}
          </button>
        </form>

        <div style={{ display: "flex", gap: "5px", marginTop: "15px" }}>
          <p style={{ fontSize: "16px " }}>Have an account ?</p>
          <Link
            style={{ textDecoration: "none", fontSize: "16px" }}
            to="/sign-in"
          >
            sign in
          </Link>
        </div>

        {error && (
          <p style={{ color: "red", fontSize: "20px", marginTop: "10px" }}>
            {error}
          </p>
        )}
      </div>
      <div className="signup-user-svg-container">
        <img src={loginSvg} alt="" className="user-signup-svg" />
      </div>
    </>
  );
};

export default SignUp;
