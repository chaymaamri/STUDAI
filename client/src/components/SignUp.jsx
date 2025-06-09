import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import './signin.css';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function SignUp() {
  const [nomPrenom, setNomPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [mdp, setMdp] = useState('');
  const [etablissement, setEtablissement] = useState('');
  const [hobbies, setHobbies] = useState('');
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const validateForm = () => {
    if (
      nomPrenom.trim() === '' ||
      email.trim() === '' ||
      mdp.trim() === '' ||
      etablissement === ''
    ) {
      setErrorMessage('Please fill in all required fields.');
      return false;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setErrorMessage('Invalid email format.');
      return false;
    }

    if (mdp.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) return;

    try {
      const response = await axios.post('/api/auth/signup', {
        nomPrenom,
        email,
        mdp,
        etablissement,
        hobbies,
      });

      setOpen(true);
      setTimeout(() => {
        navigate('/signin');
      }, 3000);
    } catch (error) {
      console.error("Signup error", error);
      if (error.response && error.response.status === 409) {
        setErrorMessage('This email is already in use. Try another.');
      } else {
        setErrorMessage('An error occurred. Please try again.');
      }
    }
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  return (
    <div className="signin-container">
      <Snackbar open={open} autoHideDuration={3000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
          Registration successful! Please check your email to activate your account.
        </Alert>
      </Snackbar>

      {errorMessage && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}

      <form className="form" onSubmit={handleSubmit}>
        <div className="flex-column"><label>Full Name</label></div>
        <div className="inputForm">
          <input
            type="text"
            className="input"
            placeholder="Enter your Full Name"
            value={nomPrenom}
            onChange={(e) => setNomPrenom(e.target.value)}
            required
          />
        </div>

        <div className="flex-column"><label>Email</label></div>
        <div className="inputForm">
          <input
            type="email"
            className="input"
            placeholder="Enter your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="flex-column"><label>Password</label></div>
        <div className="inputForm">
          <input
            type="password"
            className="input"
            placeholder="Enter your Password"
            value={mdp}
            onChange={(e) => setMdp(e.target.value)}
            required
          />
        </div>

        <div className="flex-column"><label>Your Institution</label></div>
        <div className="inputForm">
          <select
            className="input"
            value={etablissement}
            onChange={(e) => setEtablissement(e.target.value)}
            required
          >
           <option value="">Select your institution</option>
            <option value="ISG Gabes">ISG Gabès</option>
            <option value="Faculté des Sciences de Gabès">Faculté des Sciences de Gabès</option>
            <option value="Ecole Nationale d'Ingénieurs de Gabès">Ecole Nationale d'Ingénieurs de Gabès</option>
            {/* <option value="ISG Gabes">Institut Supérieur de Gestion de Gabès</option> */}
            <option value="Institut Supérieur des Langues de Gabès">Institut Supérieur des Langues de Gabès</option>
            <option value="Institut Supérieur des Arts et Métiers de Gabès">Institut Supérieur des Arts et Métiers de Gabès</option>
            <option value="Institut Supérieur de Biologie Appliquée de Medenine">Institut Supérieur de Biologie Appliquée de Medenine</option>
            <option value="Institut Supérieur des Etudes Juridiques de Gabès">Institut Supérieur des Etudes Juridiques de Gabès</option>
            <option value="Institut Supérieur d'Informatique et de Multimédia de Gabès">Institut Supérieur d'Informatique et de Multimédia de Gabès</option>
            <option value="Institut Supérieur des Sciences Appliquées et de Technologie de Gabès">Institut Supérieur des Sciences Appliquées et de Technologie de Gabès</option>
            <option value="Institut Supérieur des Sciences et Techniques des Eaux de Gabès">Institut Supérieur des Sciences et Techniques des Eaux de Gabès</option>
            <option value="Institut Supérieur des Systèmes Industriels de Gabès">Institut Supérieur des Systèmes Industriels de Gabès</option>
            <option value="Institut Supérieur des Etudes Appliquées en Humanités de Médenine">Institut Supérieur des Etudes Appliquées en Humanités de Médenine</option>
            <option value="Institut Supérieur d'Informatique de Medenine">Institut Supérieur d'Informatique de Medenine</option>
            <option value="Institut Supérieur des Arts et Métiers de Tataouine">Institut Supérieur des Arts et Métiers de Tataouine</option>
            <option value="Institut Supérieur des Sciences infirmières de Gabès">Institut Supérieur des Sciences infirmières de Gabès</option>
            <option value="Other">Other</option>

          </select>
        </div>

        <div className="flex-column"><label>Hobbies</label></div>
        <div className="inputForm">
          <input
            type="text"
            className="input"
            placeholder="Enter your hobbies"
            value={hobbies}
            onChange={(e) => setHobbies(e.target.value)}
          />
        </div>

        <button className="button-submit" type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default SignUp;
