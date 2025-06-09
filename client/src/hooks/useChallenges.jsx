import { useState, useEffect } from "react";
import axios from "axios";

const useChallenges = (userId) => {
  const [challenges, setChallenges] = useState([]);
  useEffect(() => {
    if (userId) {
      axios.get(`http://localhost:5000/api/challenges/${userId}`)
        .then(res => setChallenges(res.data))
        .catch(err => console.error(err));
    }
  }, [userId]);
  return challenges;
};

export default useChallenges;
