import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call - replace with actual authentication
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // For demo purposes - accept any email/password
      if (formData.email && formData.password) {
        toast.success("Welcome to Sabah Road Care! 🚗");

        // Store user session (replace with actual token)
        localStorage.setItem("userToken", "demo-token");
        localStorage.setItem("userEmail", formData.email);

        // Navigate to homepage
        setTimeout(() => {
          navigate("/homepage");
        }, 1000);
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google Sign In
  const handleGoogleSignIn = () => {
    toast.info("Google Sign-In will be implemented with Firebase Auth");
    // TODO: Implement Firebase Google Auth
  };

  // Demo login function
  const handleDemoLogin = () => {
    setFormData({
      email: "demo@sabahroadcare.my",
      password: "demo123",
    });
    toast.info("Demo credentials filled! Click Sign In to continue.");
  };

  return (
    <div className="login-container">
      <div className="left-panel">
        <div className="welcome-content">
          <h1>WELCOME</h1>
          <p className="subtitle">Help make our roads safer.</p>
          <p className="description">Report potholes in your area with just a few clicks.</p>
          <button className="demo-btn" onClick={handleDemoLogin}>
            Try Demo Login
          </button>
        </div>
      </div>

      <div className="right-panel">
        <div className="logo-container">
          <img src="/SRC-test.png" alt="Sabah Road Care" className="login-logo" />
        </div>
        <div className="neumorphic-card">
          <div className="card-header">
            <h2>SIGN IN</h2>
            <p>Access your Sabah Road Care account</p>
          </div>
          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a href="#" className="forgot-password">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className={`green-signin-btn ${isLoading ? "loading" : ""}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Signing in...
                </>
              ) : (
                "SIGN IN"
              )}
            </button>
          </form>

          <div className="divider">
            <hr />
            <span>OR</span>
            <hr />
          </div>

          <button className="google-btn" onClick={handleGoogleSignIn}>
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google"
            />
            Sign in with Google
          </button>
          <div className="signup-link">
            <p>
              Don't have an account? <a href="#">Sign up here</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
