import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useUser } from "../../context/UserContext";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const { login, register } = useUser();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

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

    if (
      !formData.email ||
      !formData.password ||
      (isSignUp && !formData.confirmPassword)
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    if (isSignUp && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call - replace with actual authentication
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Check if email and password are valid
      if (formData.email && formData.password) {
        if (isSignUp) {
          toast.success(
            "Account created successfully! Welcome to Sabah Road Care! 🚗"
          );
        } else {
          toast.success("Welcome back to Sabah Road Care! 🚗");
        }

        // Use the login function from context
        login({
          id: "demo-user-001",
          name: formData.email.split("@")[0], // Extract name from email
          email: formData.email,
          token: "demo-token",
        });

        // Navigate to homepage
        setTimeout(() => {
          navigate("/homepage");
        }, 1000);
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      toast.error(
        isSignUp
          ? "Sign up failed. Please try again."
          : "Login failed. Please try again."
      );
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
      confirmPassword: "",
    });
    toast.info("Demo credentials filled! Click Sign In to continue.");
  };

  return (
    <div className="login-container">
      <div className="left-panel">
        <div className="welcome-content">
          <h1>WELCOME</h1>
          <p className="subtitle">Help make our roads safer.</p>
          <p className="description">
            Report potholes in your area with just a few clicks.
          </p>
          <button className="demo-btn" onClick={handleDemoLogin}>
            Try Demo Login
          </button>
        </div>
      </div>

      <div className="right-panel">
        <div className="logo-container">
          <img
            src="/SRC-test.png"
            alt="Sabah Road Care"
            className="login-logo"
          />
        </div>
        <div className="neumorphic-card">
          <div className="card-header">
            <h2>{isSignUp ? "SIGN UP" : "SIGN IN"}</h2>
            <p>
              {isSignUp
                ? "Create your Sabah Road Care account"
                : "Access your Sabah Road Care account"}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-input-group">
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

            <div className="login-input-group">
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

            {isSignUp && (
              <div className="login-input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>
            )}

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
                  {isSignUp ? "Creating Account..." : "Signing in..."}
                </>
              ) : isSignUp ? (
                "CREATE ACCOUNT"
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
            {isSignUp ? "Sign up with Google" : "Sign in with Google"}
          </button>
          <div className="signup-link">
            <p>
              {isSignUp
                ? "Already have an account? "
                : "Don't have an account? "}
              <button
                type="button"
                className="toggle-auth-btn"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? "Sign in here" : "Sign up here"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
