import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const GamificationContext = createContext();

export const GamificationProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [badges, setBadges] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      fetchUserData(storedUser.id);
    }
  }, []);

  const fetchUserData = async (userId) => {
    try {
      const [badgesRes, challengesRes, leaderboardRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/user/${userId}/badges`),
        axios.get(`http://localhost:5000/api/user/${userId}/challenges`),
        axios.get("http://localhost:5000/api/leaderboard/top-users"),
      ]);

      setBadges(badgesRes.data);
      setChallenges(challengesRes.data);
      setLeaderboard(leaderboardRes.data);
      setLoading(false);
    } catch (error) {
      console.error("❌ Erreur lors du chargement des données :", error);
    }
  };

  return (
    <GamificationContext.Provider
      value={{ user, badges, challenges, leaderboard, fetchUserData }}
    >
      {children}
    </GamificationContext.Provider>
  );
};
