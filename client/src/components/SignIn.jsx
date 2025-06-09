import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import "./signin.css";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";


const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function SignIn() {
  const [email, setEmail] = useState("");
  const [mdp, setMdp] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext)
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setOpen(false);
  
    try {
      const user = await login(email, mdp); // n'appelle que la fonction login du context
      setOpen(true);
  
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setError("Incorrect email or password.");
      } else if (error.response?.status === 403) {
        const errorMessage = error.response?.data;
        if (errorMessage === "Your account has been rejected. Please contact the administrator.") {
          setError("Your account has been rejected. Please contact the administrator.");
        } else if (errorMessage === "Your account is not activated. Please check your email.") {
          setError("Your account is not activated. Please check your email.");
        } else {
          setError("Access denied.");
        }
      } else {
        setError("An error occurred. Please try again.");
      }
      setOpen(true);
    }
  };
  
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  return (
    <div className="signin-container">
      <Snackbar open={open} autoHideDuration={2000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={error ? "error" : "success"} sx={{ width: "100%" }}>
          {error ? error : "Login successful!"}
        </Alert>
      </Snackbar>

      <form className="form" onSubmit={handleSubmit}>
        <div className="flex-column">
          <label>Email</label>
        </div>
        <div className="inputForm">
          <input
            type="text"
            className="input"
            placeholder="Enter your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="flex-column">
          <label>Password</label>
        </div>
        <div className="inputForm">
          <input
            type="password"
            className="input"
            placeholder="Enter your password"
            value={mdp}
            onChange={(e) => setMdp(e.target.value)}
            required
          />
        </div>

        {/* <div className="flex-row">
          <div>
            <input type="checkbox" />
            <label>Remember me</label>
          </div>
          <span className="span">Forgot password?</span>
        </div> */}

        <button className="button-submit" type="submit">
          Sign In
        </button>

        <p className="p">
          Don't have an account?{" "}
          <Link to="/signup" className="span">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
}

export default SignIn;
