import Card from './Card';
import Leaderboard from './Leaderboard'; // Importation du composant Leaderboard
import { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [badges, setBadges] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      setError("User not found, please log in again.");
      return;
    }

    axios.get(`http://localhost:5000/api/user/${storedUser.id}`)
    .then(res => setUser(res.data))
    .catch(() => setError("Unable to fetch user information."));

  axios.get(`http://localhost:5000/api/user/${storedUser.id}/badges`)
    .then(response => setBadges(response.data))
    .catch(error => console.error("Error fetching badges:", error));

  axios.get(`http://localhost:5000/api/user/${storedUser.id}/challenges`)
    .then(response => setChallenges(response.data))
    .catch(error => console.error("Error fetching challenges:", error));
}, []);
  if (error) return <p>{error}</p>;
  if (!user) return <p>Loading...</p>;

  return (
    <>
      <Card user={user} badges={badges} challenges={challenges} />
      <Leaderboard /> {/* Affichage du Leaderboard */}
    </>
  );
};

export default Dashboard;
