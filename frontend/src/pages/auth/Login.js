import React, { useState, useEffect } from "react";
import styles from "./auth.module.scss";
import { BiLogIn } from "react-icons/bi";
import { FaGoogle, FaFacebook, FaTwitter, FaEye, FaEyeSlash } from "react-icons/fa";
import Card from "../../components/card/Card";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { loginUser, validateEmail } from "../../services/authService";
import { SET_LOGIN, SET_NAME } from "../../redux/features/auth/authSlice";
import Loader from "../../components/loader/Loader";

const initialState = {
  email: "",
  password: "",
};

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState(initialState);
  const { email, password } = formData;
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState({});
  const [isTyping, setIsTyping] = useState(false);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setIsTyping(true);
    
    // Clear specific error when user starts typing
    if (formError[name]) {
      setFormError({
        ...formError,
        [name]: ""
      });
    }
  };

  const validateForm = () => {
    let isValid = true;
    const errors = {};

    if (!email) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!validateEmail(email)) {
      errors.email = "Please enter a valid email";
      isValid = false;
    }

    if (!password) {
      errors.password = "Password is required";
      isValid = false;
    }

    setFormError(errors);
    return isValid;
  };

  const login = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const userData = {
      email,
      password,
    };
    
    setIsLoading(true);
    try {
      const data = await loginUser(userData);
      
      // Show success notification
      toast.success("Login successful!", {
        position: "top-right",
        autoClose: 3000,
      });
      
      // Simulate a slight delay for better UX
      setTimeout(async () => {
        await dispatch(SET_LOGIN(true));
        await dispatch(SET_NAME(data.name));
        navigate("/dashboard");
        setIsLoading(false);
      }, 1000);
      
    } catch (error) {
      setIsLoading(false);
      // Handle specific error responses
      const errorMessage = error.response?.data?.message || "Login failed. Please try again.";
      toast.error(errorMessage);
    }
  };

  // Add focus effect to simulate material design
  useEffect(() => {
    const inputs = document.querySelectorAll("input");
    
    inputs.forEach(input => {
      if (input.value) {
        input.classList.add("has-value");
      }
      
      input.addEventListener("focus", () => {
        input.parentElement.classList.add("focused");
      });
      
      input.addEventListener("blur", () => {
        input.parentElement.classList.remove("focused");
        if (input.value) {
          input.classList.add("has-value");
        } else {
          input.classList.remove("has-value");
        }
      });
    });
    
    return () => {
      inputs.forEach(input => {
        input.removeEventListener("focus", () => {});
        input.removeEventListener("blur", () => {});
      });
    };
  }, [isTyping]);

  return (
    <div className={`container ${styles.auth}`}>
      {isLoading && <div className={styles["loader-container"]}><Loader /></div>}
      
      {/* SVG Gradient for Icons */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3865f5" />
          <stop offset="100%" stopColor="#6c63ff" />
        </linearGradient>
      </svg>
      
      <Card>
        <div className={styles.form}>
          <div className={styles["icon-wrapper"]}>
            <BiLogIn size={40} />
          </div>
          <h2>Welcome Back</h2>

          <form onSubmit={login}>
            <div className={styles["input-group"]}>
              <input
                type="email"
                placeholder=" "
                required
                name="email"
                value={email}
                onChange={handleInputChange}
                className={formError.email ? styles.error : ""}
              />
              <label>Email</label>
              {formError.email && <small className={styles["error-message"]}>{formError.email}</small>}
            </div>
            
            <div className={styles["input-group"]}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder=" "
                required
                name="password"
                value={password}
                onChange={handleInputChange}
                className={formError.password ? styles.error : ""}
              />
              <label>Password</label>
              <button 
                type="button" 
                className={styles["password-toggle"]} 
                // onClick={togglePassword}
                // tabIndex="-1"
                onClick={() => setShowPassword(!showPassword)}
  aria-label="Toggle password visibility"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              {formError.password && <small className={styles["error-message"]}>{formError.password}</small>}
            </div>
            
            <div className={styles.links}>
              <Link to="/forgot">Forgot Password?</Link>
              <span></span>
            </div>
            
            <button type="submit" className="--btn --btn-primary --btn-block">
              Login
            </button>
            
            
            
          </form>

          <div className={styles.register}>
            <Link to="/">Home</Link>
            <p>Don't have an account?</p>
            <Link to="/register">Register Now</Link>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Login;