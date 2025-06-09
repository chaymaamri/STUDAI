import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ActivateAccount = () => {
  const { token } = useParams();

  useEffect(() => {
    const activateAccount = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/auth/activate/${token}`);
        alert(response.data.message);
      } catch (error) {
        alert("Activation failed. Please try again.");
      }
    };

    activateAccount();
  }, [token]);

  return (
    <div>
      <h1>Activating your account...</h1>
    </div>
  );
};

export default ActivateAccount;