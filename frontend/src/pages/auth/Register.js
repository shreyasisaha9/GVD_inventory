import React, { useState, useEffect } from "react";
import styles from "./auth.module.scss";
import { TiUserAddOutline } from "react-icons/ti";
import { FaGoogle, FaFacebook, FaTwitter, FaEye, FaEyeSlash, FaCheckCircle } from "react-icons/fa";
import Card from "../../components/card/Card";
import { toast } from "react-toastify";
import { registerUser, validateEmail } from "../../services/authService";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { SET_LOGIN, SET_NAME } from "../../redux/features/auth/authSlice";
import Loader from "../../components/loader/Loader";

const initialState = {
  name: "",
  email: "",
  password: "",
  password2: "",
};

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState(initialState);
  const { name, email, password, password2 } = formData;
  const [showPassword, setShowPassword] = useState({
    password: false,
    password2: false
  });
  const [formError, setFormError] = useState({});
  const [formSuccess, setFormSuccess] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  const togglePassword = (field) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field]
    });
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
    
    // Password strength checker
    if (name === "password") {
      checkPasswordStrength(value);
    }
    
    // Check password match in real-time
    if (name === "password2" && password) {
      if (value === password) {
        setFormSuccess({ ...formSuccess, password2: "Passwords match" });
        setFormError({ ...formError, password2: "" });
      } else if (value) {
        setFormError({ ...formError, password2: "Passwords do not match" });
        setFormSuccess({ ...formSuccess, password2: "" });
      }
    }
    
    // Update matched status if main password changes
    if (name === "password" && password2) {
      if (value === password2) {
        setFormSuccess({ ...formSuccess, password2: "Passwords match" });
        setFormError({ ...formError, password2: "" });
      } else {
        setFormError({ ...formError, password2: "Passwords do not match" });
        setFormSuccess({ ...formSuccess, password2: "" });
      }
    }
    
    // Check email format in real-time
    if (name === "email" && value) {
      if (validateEmail(value)) {
        setFormSuccess({ ...formSuccess, email: "Valid email format" });
        setFormError({ ...formError, email: "" });
      } else {
        setFormError({ ...formError, email: "Invalid email format" });
        setFormSuccess({ ...formSuccess, email: "" });
      }
    }
  };
  
  const checkPasswordStrength = (password) => {
    // Password strength criteria
    const hasLength = password.length >= 6;
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    let strength = 0;
    if (hasLength) strength += 1;
    if (hasLowerCase) strength += 1;
    if (hasUpperCase) strength += 1;
    if (hasNumber) strength += 1;
    if (hasSpecialChar) strength += 1;
    
    setPasswordStrength(strength);
  };

  const validateForm = () => {
    let isValid = true;
    const errors = {};

    if (!name) {
      errors.name = "Name is required";
      isValid = false;
    }

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
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    if (!password2) {
      errors.password2 = "Please confirm your password";
      isValid = false;
    } else if (password !== password2) {
      errors.password2 = "Passwords do not match";
      isValid = false;
    }

    setFormError(errors);
    return isValid;
  };

  const register = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const userData = {
      name,
      email,
      password,
    };
    
    setIsLoading(true);
    try {
      const data = await registerUser(userData);
      
      // Show success notification
      toast.success("Registration successful!", {
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
      const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
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
            <TiUserAddOutline size={40} />
          </div>
          <h2>Create Account</h2>

          <form onSubmit={register}>
            <div className={styles["input-group"]}>
              <input
                type="text"
                placeholder=" "
                required
                name="name"
                value={name}
                onChange={handleInputChange}
                className={formError.name ? styles.error : ""}
                autoComplete="name"
              />
              <label>Full Name</label>
              {formError.name && <small className={styles["error-message"]}>{formError.name}</small>}
            </div>
            
            <div className={styles["input-group"]}>
              <input
                type="email"
                placeholder=" "
                required
                name="email"
                value={email}
                onChange={handleInputChange}
                className={formError.email ? styles.error : ""}
                autoComplete="email"
              />
              <label>Email</label>
              {formError.email && <small className={styles["error-message"]}>{formError.email}</small>}
              {formSuccess.email && (
                <small className={styles["success-message"]}>
                  <FaCheckCircle /> {formSuccess.email}
                </small>
              )}
            </div>
            
            <div className={styles["input-group"]}>
              <input
                type={showPassword.password ? "text" : "password"}
                placeholder=" "
                required
                name="password"
                value={password}
                onChange={handleInputChange}
                className={formError.password ? styles.error : ""}
                autoComplete="new-password"
              />
              <label>Password</label>
              <button 
                type="button" 
                className={styles["password-toggle"]} 
                onClick={() => togglePassword("password")}
                tabIndex="-1"
              >
                {showPassword.password ? <FaEyeSlash /> : <FaEye />}
              </button>
              {formError.password && <small className={styles["error-message"]}>{formError.password}</small>}
              
              {/* Password Strength Indicator */}
              {password && (
                <div className={styles["password-strength"]}>
                  <div className={styles["strength-bars"]}>
                    <div className={`${styles.bar} ${passwordStrength >= 1 ? styles.active : ''} ${passwordStrength >= 3 ? styles.medium : ''} ${passwordStrength >= 5 ? styles.strong : ''}`}></div>
                    <div className={`${styles.bar} ${passwordStrength >= 2 ? styles.active : ''} ${passwordStrength >= 3 ? styles.medium : ''} ${passwordStrength >= 5 ? styles.strong : ''}`}></div>
                    <div className={`${styles.bar} ${passwordStrength >= 3 ? styles.active : ''} ${passwordStrength >= 3 ? styles.medium : ''} ${passwordStrength >= 5 ? styles.strong : ''}`}></div>
                    <div className={`${styles.bar} ${passwordStrength >= 4 ? styles.active : ''} ${passwordStrength >= 4 ? styles.strong : ''}`}></div>
                    <div className={`${styles.bar} ${passwordStrength >= 5 ? styles.active : ''} ${passwordStrength >= 5 ? styles.strong : ''}`}></div>
                  </div>
                  <small>
                    {passwordStrength === 0 && "Very weak"}
                    {passwordStrength === 1 && "Very weak"}
                    {passwordStrength === 2 && "Weak"}
                    {passwordStrength === 3 && "Medium"}
                    {passwordStrength === 4 && "Strong"}
                    {passwordStrength === 5 && "Very strong"}
                  </small>
                </div>
              )}
            </div>
            
            <div className={styles["input-group"]}>
              <input
                type={showPassword.password2 ? "text" : "password"}
                placeholder=" "
                required
                name="password2"
                value={password2}
                onChange={handleInputChange}
                className={formError.password2 ? styles.error : ""}
                autoComplete="new-password"
              />
              <label>Confirm Password</label>
              <button 
                type="button" 
                className={styles["password-toggle"]} 
                onClick={() => togglePassword("password2")}
                tabIndex="-1"
              >
                {showPassword.password2 ? <FaEyeSlash /> : <FaEye />}
              </button>
              {formError.password2 && <small className={styles["error-message"]}>{formError.password2}</small>}
              {formSuccess.password2 && (
                <small className={styles["success-message"]}>
                  <FaCheckCircle /> {formSuccess.password2}
                </small>
              )}
            </div>
            
            <button type="submit" className="--btn --btn-primary --btn-block">
              Create Account
            </button>
            
            <div className={styles["social-login"]}>
              <div className={styles.divider}>
                <span>Or register with</span>
              </div>
              
              <div className={styles["social-buttons"]}>
                <button type="button" className={styles.google}>
                  <FaGoogle />
                </button>
                <button type="button" className={styles.facebook}>
                  <FaFacebook />
                </button>
                <button type="button" className={styles.twitter}>
                  <FaTwitter />
                </button>
              </div>
            </div>
          </form>

          <div className={styles["login-link"]}>
            <Link to="/">Home</Link>
            <p>Already have an account?</p>
            <Link to="/login">Login</Link>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Register;