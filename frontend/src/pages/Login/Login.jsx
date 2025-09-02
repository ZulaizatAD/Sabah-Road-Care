import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useUser } from "../../context/UserContext";
import assets from "../../assets/assets";
import { signIn, signUp } from "../../services/userApi";
import LogoLoopVideoAnimation from "../../components/VideoBG/LogoLoopVideo/LogoLoopVideoAnimation";
import "./Login.css";
import { showErrorToast, showSuccessToast, showInfoToast } from "../../utils/toast";

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useUser();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/homepage", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Load remembered user on component mount
  useEffect(() => {
    const remembered = localStorage.getItem("rememberUser");
    if (remembered) {
      try {
        const { email, timestamp } = JSON.parse(remembered);
        // Check if not expired (30 days)
        const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
        if (Date.now() - timestamp < thirtyDaysInMs) {
          setFormData((prev) => ({ ...prev, email }));
          setRememberMe(true);
        } else {
          // Remove expired remember data
          localStorage.removeItem("rememberUser");
        }
      } catch (error) {
        console.error("Error parsing remembered user:", error);
        localStorage.removeItem("rememberUser");
      }
    }
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle remember me checkbox
  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
  };

  // Toggle between sign in and sign up with form reset
  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setFormData({
      email: rememberMe ? formData.email : "",
      password: "",
      confirmPassword: "",
    });
    setShowPassword(false);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.email ||
      !formData.password ||
      (isSignUp && !formData.confirmPassword)
    ) {
      showErrorToast("Please fill in all fields");
      return;
    }

    if (isSignUp && formData.password !== formData.confirmPassword) {
      showErrorToast("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      let userData;

      if (isSignUp) {
        await signUp(
          formData.email,
          formData.email.split("@")[0],
          formData.password,
          formData.confirmPassword
        );

        showSuccessToast("Account created successfully! Please log in.");
        setIsSignUp(false); // switch to login after signup
        setFormData({
          email: formData.email,
          password: "",
          confirmPassword: "",
        });
        setIsLoading(false);
        return;
      } else {
        // Call API sign in
        const data = await signIn(formData.email, formData.password);

        userData = {
          id: data.user?.id || "unknown",
          name: data.user?.full_name || formData.email.split("@")[0],
          email: data.user?.email || formData.email,
          token: data.access_token,
        };

        // Handle remember me
        if (rememberMe) {
          localStorage.setItem(
            "rememberUser",
            JSON.stringify({
              email: formData.email,
              timestamp: Date.now(),
            })
          );
        } else {
          localStorage.removeItem("rememberUser");
        }

        // Save to context
        login(userData);

        showSuccessToast("Welcome back to Sabah Road Care!");

        // Redirect after successful login
        setTimeout(() => {
          navigate("/homepage");
        }, 1000);
      }
    } catch (error) {
      console.error(error);

      if (error.response?.status === 401) {
        showErrorToast("Invalid credentials. Please try again.");
      } else if (error.response?.status === 409) {
        showErrorToast("Email already exists. Please sign in instead.");
        setIsSignUp(false);
      } else if (error.response?.status >= 500) {
        showErrorToast("Server error. Please try again later.");
      } else {
        showErrorToast(
          isSignUp
            ? error.response?.data?.detail ||
                "Sign up failed. Please try again."
            : error.response?.data?.detail || "Login failed. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google Sign In
  const handleGoogleSignIn = () => {
    showInfoToast("Google Sign-In will be implemented with Firebase Auth");
  };

  // Demo login function
  const handleDemoLogin = () => {
    setFormData({
      email: "zul@example.com",
      password: "password123",
      confirmPassword: "",
    });
    showInfoToast("Demo credentials filled! Click Sign In to continue.");
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
          <LogoLoopVideoAnimation />
        </div>
        <div className={`neumorphic-card ${isSignUp ? 'signup-mode' : ''}`}>
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
                placeholder="Password"
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
                {showPassword ? (
                  <img src={assets.passwordHide} alt="Hide password" />
                ) : (
                  <img src={assets.passwordShow} alt="Show password" />
                )}
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

            {!isSignUp && (
              <div className="form-options">
                <label className="remember-me">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={handleRememberMeChange}
                  />
                  <span>Remember me</span>
                </label>
                <a
                  href="#"
                  className="forgot-password"
                  onClick={(e) => {
                    e.preventDefault();
                    showInfoToast("Password reset feature coming soon!");
                  }}
                >
                  Forgot password?
                </a>
              </div>
            )}

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
            <img src={assets.GoogleLogo} alt="Google Logo" />
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
                onClick={toggleAuthMode}
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
