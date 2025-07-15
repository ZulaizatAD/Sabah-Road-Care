import React from "react";
import assets from "../../assets/assets";
import "./Login.css";

const Login = () => {
  return (
    <div className="login">
      <img src={assets.SRC_white} alt="" className="logo" />
      <form action="" className="login-form">
        <h2>
          <input type="text" placeholder="username" className="form-input" />
          <input
            type="password"
            placeholder="password"
            className="form-input"
          />
        </h2>
        <button className="login-btn">Login</button>
        <p className="login-toggle">
          Forgot Password ? <span> Reset Here</span>
        </p>
      </form>
    </div>
  );
};

export default Login;
