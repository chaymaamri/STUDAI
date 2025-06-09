import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import "../components/signin.css";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function AdminSignIn() {
  const [email, setEmail] = useState("");
  const [mdp, setMdp] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setOpen(false);

    try {
      // Appel à l'endpoint de connexion admin
      const response = await axios.post("http://localhost:5000/api/admin/signin", {
        email,
        mdp,
      });

      // Stocke le token et les infos de l'utilisateur (incluant le rôle)
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify({
          id: response.data.user.id,
          nomPrenom: response.data.user.nomPrenom,
          role: response.data.user.role,
      }));

      setOpen(true);
      setTimeout(() => {
        // Redirection vers le dashboard admin
        navigate("/admin");
      }, 2000);
    } catch (error) {
      if (error.response?.status === 401) {
        setError("Email or password incorrect.");
      } else if (error.response?.status === 403) {
        setError("Access refused: you are not administrator or your account is not activated.");
      } else {
        setError("An error occurred. Please try again.");
      }
      setOpen(true);
    }
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") return;
    setOpen(false);
  };

  return (
    <div className="signin-container">
      <Snackbar open={open} autoHideDuration={2000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={error ? "error" : "success"} sx={{ width: "100%" }}>
          {error ? error : "Successful admin connection !"}
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
            placeholder="Enter your email"
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

        <button className="button-submit" type="submit">
        Log in
        </button>
      </form>

      <p className="p">
        {/* Retour à la <Link to="http://localhost:3000" className="span">connexion utilisateur</Link> */}
      </p>
    </div>
  );
}

export default AdminSignIn;
