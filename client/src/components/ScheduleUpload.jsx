import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Typography,
  Box,
  Grid,
  Snackbar,
  Alert,
  Grow,
  Card,
  CardContent,
  IconButton,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,

} from "@mui/material";

import { useDropzone } from "react-dropzone";
import DeleteIcon from '@mui/icons-material/Delete';
import Loaders from "./Loaders"; // Import the Loaders component 
import "./ScheduleUpload.css"; // Assuming you save the CSS in this file 
import CloseIcon from "@mui/icons-material/Close";
function ScheduleUpload() {
  const [file, setFile] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [activitySuggestions, setActivitySuggestions] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [loadingActivitySuggestions, setLoadingActivitySuggestions] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [scheduleExists, setScheduleExists] = useState(false);
const [showRewardModal, setShowRewardModal] = useState(false);
const [pointsEarned, setPointsEarned] = useState(null);
const [badgeEarned, setBadgeEarned] = useState(null);
const [revisionBadgeEarned, setRevisionBadgeEarned] = useState(false);
  // Helper function to get emoji based on context
  const getEmojiForSuggestion = (suggestion) => {
    const emojiMap = {
      music: '🎶',
      lecture: '📚',
      sport: '🏅',
      shopping: '🛒',
      cooking: '🍳',
      study: '📖',
      game: '🎮',
      relax: '🛋️',
      work: '💼',
      exercise: '💪',
      read: '📖',
      write: '✍️',
      clean: '🧹',
      travel: '✈️',
      movie: '🎬',
      party: '🎉',
      sleep: '😴',
      meditate: '🧘',
      code: '💻',
      draw: '🎨'
    };

    for (const [keyword, emoji] of Object.entries(emojiMap)) {
      if (suggestion.toLowerCase().includes(keyword)) {
        return emoji;
      }
    }
 // Default to a random emoji if no keyword matches
 const randomEmojis = ['🌟', '🔥', '💪', '🚀', '🎯', '🏅',  '✨', '⚡', '📚', '🧠', '💡', '🔍', '🛠️', '🧩', ];
 return randomEmojis[Math.floor(Math.random() * randomEmojis.length)];

   
   
  };

  // Helper functions to get the current and next day
  const getNextDay = () => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    const nextDayIndex = (today.getDay() + 1) % 7;
    return daysOfWeek[nextDayIndex];
  };

  const getCurrentDay = () => {
    const daysOfWeek =['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    return daysOfWeek[today.getDay()];
  };

  const nextDay = getNextDay();
  const currentDay = getCurrentDay();

  useEffect(() => {
    const checkScheduleExists = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser || !storedUser.id) {
        console.error("❌ Error: User ID not found.");
        return;
      }
      try {
        const response = await axios.get(`http://localhost:5000/api/schedule-exists/${storedUser.id}`);
        setScheduleExists(response.data.exists);
      } catch (error) {
        console.error("❌ Error when verifying the timetable:", error);
      }
    };

    checkScheduleExists();
  }, []);

  const fetchSuggestions = async () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser || !storedUser.id) {
      console.error("❌ Error : User ID not found.");
      return;
    }
    const suggestionsKey = `suggestions_${storedUser.id}`;
    const suggestionsDateKey = `${suggestionsKey}_date`;
    const storedSuggestions = localStorage.getItem(suggestionsKey);
    const storedDate = localStorage.getItem(suggestionsDateKey);
    const today = new Date().toLocaleDateString();

    // Si on a des suggestions et qu'elles ont été générées aujourd'hui, on les utilise
    if (storedSuggestions && storedDate === today) {
      setSuggestions(JSON.parse(storedSuggestions));
    } else {
      setLoadingSuggestions(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/schedule-suggestions/${storedUser.id}`);
        if (Array.isArray(response.data.suggestions)) {
          setSuggestions(response.data.suggestions);
          // Stocke les suggestions et la date du jour
          localStorage.setItem(suggestionsKey, JSON.stringify(response.data.suggestions));
          localStorage.setItem(suggestionsDateKey, today);
        } else if (typeof response.data.suggestions === 'string') {
          setSuggestions([response.data.suggestions]);
        } else {
          console.error("Les suggestions ne sont pas un tableau :", response.data.suggestions);
          setSuggestions([]);
        }
      } catch (error) {
        console.error("❌ Erreur lors de la récupération des suggestions :", error);
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }
  };


  useEffect(() => {
    
    fetchSuggestions();
  }, []);
  
  const onDrop = (acceptedFiles) => {
    const uploadedFile = acceptedFiles[0];
    setFile(uploadedFile);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("pdf", file);
    const storedUser = JSON.parse(localStorage.getItem("user"));
    formData.append("userId", storedUser.id);
    setLoading(true);
  
    try {
      const response = await axios.post("http://localhost:5000/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      console.log("Réponse du serveur :", response.data);
      setSnackbarMessage("Successful upload !");
      setOpenSnackbar(true);
  
      // Invalider le cache des suggestions après un upload réussi
      localStorage.removeItem(`suggestions_${storedUser.id}`);
      localStorage.removeItem(`suggestions_${storedUser.id}_date`);
      localStorage.removeItem(`activity_suggestions_${storedUser.id}`);
  
      // Recharger les suggestions fraîchement depuis l'API
      await fetchSuggestions(); // avec await pour attendre le chargement

  
      // Afficher la modal combinée pour les points et le badge
      setPointsEarned(15); // Points ajoutés
      setBadgeEarned(response.data.badge || null); // Badge reçu (si disponible)
      setShowRewardModal(true);
  
      // Fermer la modal après un délai
      setTimeout(() => {
        setShowRewardModal(false);
        setPointsEarned(null);
        setBadgeEarned(null);
      }, 20000);
    } catch (error) {
      console.error("Upload done :", error);
      setSnackbarMessage("Upload done!");
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };
  const handleFollowSuggestion = async () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    try {
      const response = await axios.post("http://localhost:5000/api/revision-suggestions/follow", {
        userId: storedUser.id
      });
      setSnackbarMessage(response.data.message);
      setOpenSnackbar(true);
  
      // Vérifier si le badge "Pro de la Révision" a été attribué
      if (response.data.message.includes("Badge 'pro of revision' awarded")) {
        setRevisionBadgeEarned(true); // Mettre à jour l'état pour afficher la modal
      }
    } catch (error) {
      console.error("Erreur lors du suivi de la suggestion :", error);
      setSnackbarMessage("Error when monitoring the suggestion!");
      setOpenSnackbar(true);
    }
  };
  

  const handleModify = async () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser || !storedUser.id) {
      console.error("❌ Error : User ID not found.");
      return;
    }
  
    try {
      await axios.delete(`http://localhost:5000/api/schedule/${storedUser.id}`);
      setFile(null);
      setScheduleExists(false);
      setSuggestions([]);
      setSnackbarMessage(" Schedule successfully removed !");
      setOpenSnackbar(true);
  
      // Invalider les caches liés aux suggestions
      localStorage.removeItem(`suggestions_${storedUser.id}`);
      localStorage.removeItem(`suggestions_${storedUser.id}_date`);
      localStorage.removeItem(`activity_suggestions_${storedUser.id}`);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'emploi du temps :", error);
      setSnackbarMessage("Error when deleting the Schedule !");
      setOpenSnackbar(true);
    }
  };
  

  // const fetchSuggestions = async () => {
  //   const storedUser  = JSON.parse(localStorage.getItem("user"));
  //   if (!storedUser  || !storedUser .id) {
  //     console.error("❌ Error : ID utilisateur introuvable.");
  //     return;
  //   }
  
  //   try {
  //     const response = await axios.get(`http://localhost:5000/api/suggestions/${storedUser .id}`);
  //     if (response.data.suggestions) {
  //       // Vérifiez la structure des suggestions
  //       console.log("Suggestions reçues :", response.data.suggestions);
  //       setSuggestions(response.data.suggestions);
  //       localStorage.setItem("suggestions", JSON.stringify(response.data.suggestions));
  //     } else {
  //       setSuggestions([]);
  //     }
  //   } catch (error) {
  //     console.error("❌ Erreur lors de la récupération des suggestions :", error);
  //     setSuggestions([]);
  //   }
  // };

  const fetchActivitySuggestions = async () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser || !storedUser.id) {
      console.error("❌ Erreur : ID utilisateur introuvable.");
      return;
    }
    setLoadingActivitySuggestions(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/activity-suggestions/${storedUser.id}`);
      setActivitySuggestions(response.data.suggestions);
    } catch (error) {
      console.error("Erreur lors de la récupération des suggestions d'activités :", error);
    } finally {
      setLoadingActivitySuggestions(false);
    }
  };
  
  useEffect(() => {
    fetchActivitySuggestions();
  }, []); // À chaque montage ou après modification de la todo list, vous pouvez rappeler cette fonction.
  

  const handleDelete = () => {
    setFile(null);
    setSuggestions([]);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  // Fonction pour marquer la todo list comme modifiée
  // const markTodoListAsModified = () => {
  //   setTodoListModified(true);
  // };

  // Vérification de la structure des suggestions avant le rendu
  if (!Array.isArray(suggestions)) {
    console.error("Les suggestions ne sont pas un tableau :", suggestions);
  } else {
    suggestions.forEach(item => {
      if (typeof item.subject !== 'string') {
        console.error("subject n'est pas une chaîne :", item.subject);
      }
      if (!Array.isArray(item.suggestions)) {
        console.error("suggestions n'est pas un tableau :", item.suggestions);
      }
    });
  }
  console.log("Données reçues pour suggestions :", suggestions);

  return (
    <Box sx={{ p: 2 }}>
      <Dialog
  open={revisionBadgeEarned}
  onClose={() => setRevisionBadgeEarned(false)}
  sx={{ zIndex: 2000 }}
>
  <DialogTitle sx={{ position: "relative", textAlign: "center" }}>
    🎉 Congratulations ! 🎉
    <IconButton
      onClick={() => setRevisionBadgeEarned(false)}
      sx={{ position: "absolute", right: 8, top: 8 }}
    >
      <CloseIcon />
    </IconButton>
  </DialogTitle>
  <DialogContent sx={{ textAlign: "center", position: "relative" }}>
    <Typography variant="h6" sx={{ marginTop: 4 }}>
      🏅 You got the badge : <strong>Revision pro</strong> !
    </Typography>
    <div className="emoji-container" style={{ marginTop: "16px" }}>
      <span className="emoji">🎉</span>
      <span className="emoji">✨</span>
      <span className="emoji">🎈</span>
      <span className="emoji">🎊</span>
    </div>
  </DialogContent>
</Dialog>
      <Typography variant="h5" gutterBottom>
        {/* Add your title here */}
      </Typography>
      {scheduleExists ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" gutterBottom>
          You have already imported a schedule.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleModify}
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#115293',
              },
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '16px',
            }}
          >
            Modify the schedule
          </Button>
        </Box>
      ) : (
        <Box {...getRootProps()} sx={{ textAlign: 'center', cursor: 'pointer' }}>
          <div className="container">
            <div className="folder">
              <div className="front-side">
                <div className="tip"></div>
                <div className="cover"></div>
              </div>
              <div className="back-side cover"></div>
            </div>
            <label className="custom-file-upload">
              <input {...getInputProps()} />
              {file ? file.name : "📂Import your schedule"}
            </label>
          </div>
        </Box>
      )}
      {!scheduleExists && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button
            className="btn1"
            variant="contained"
            color="primary"
            onClick={handleUpload}
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#115293',
              },
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '16px',
            }}
            disabled={!file}
          >
            Upload
          </Button>
          {file && (
            <IconButton
              color="secondary"
              onClick={handleDelete}
              sx={{ ml: 2 }}
            >
              <DeleteIcon />
            </IconButton>
          )}
<Dialog
  open={showRewardModal}
  onClose={() => {
    setShowRewardModal(false);
    setPointsEarned(null);
    setBadgeEarned(null);
  }}
  sx={{ zIndex: 2000 }}
>
  <DialogTitle sx={{ position: "relative", textAlign: "center" }}>
    🎉 Congratulations ! 🎉
    <IconButton
      onClick={() => {
        setShowRewardModal(false);
        setPointsEarned(null);
        setBadgeEarned(null);
      }}
      sx={{ position: "absolute", right: 8, top: 8 }}
    >
      <CloseIcon />
    </IconButton>
  </DialogTitle>
  <DialogContent sx={{ textAlign: "center", position: "relative" }}>
    <div className="guirlande-container">
      <div className="guirlande"></div>
      <div className="guirlande"></div>
    </div>
    <Typography variant="h6" sx={{ marginTop: 4 }}>
      🎊You have won{pointsEarned} point{pointsEarned > 1 ? "s" : ""} ! 🎊
      🏅 You have obtained the badge: Organized!
    </Typography>
    {badgeEarned && (
      <Typography variant="h6" sx={{ marginTop: 2 }}>
        🏅 You have obtained the badge: <strong>{badgeEarned}</strong> !
      </Typography>
    )}
    <div className="emoji-container" style={{ marginTop: "16px" }}>
      <span className="emoji">🎉</span>
      <span className="emoji">✨</span>
      <span className="emoji">🎈</span>
      <span className="emoji">🎊</span>
    </div>
  </DialogContent>
</Dialog>
        </Box>
        
      )}

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          🎓 Revision suggestions for {currentDay}
        </Typography>
        {loadingSuggestions && <Loaders />}
        <Grid container spacing={2}>
        {Array.isArray(suggestions) && suggestions.map((item, index) => (
  <Grow in={true} key={index} timeout={1000}>
    <Grid item xs={12} sm={6} md={4}>
      <Card variant="outlined" sx={{ borderRadius: '12px', boxShadow: 3 }}>
        <CardContent>
          {typeof item.subject === "string" && (
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
              📖 {item.subject}
            </Typography>
          )}
          <Box sx={{ mt: 1 }}>
            {Array.isArray(item.suggestions) && item.suggestions.map((suggestion, idx) => (
              <Typography key={idx} variant="body2" color="text.primary" sx={{ mb: 1, fontSize: '16px' }}>
                {getEmojiForSuggestion(suggestion)} {suggestion}
              </Typography>
            ))}
          </Box>
          {/* Bouton pour confirmer le suivi de la suggestion */}
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Button variant="contained" color="secondary" onClick={handleFollowSuggestion}>
            I followed this suggestion
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  </Grow>
))}

        </Grid>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          🏃‍♂️ Activities suggestions
        </Typography>
        {loadingActivitySuggestions && <Loaders />}
        <Grid container spacing={2}>
          <Grow in={true} timeout={1000}>
            <Grid item xs={12}>
              <Card variant="outlined" sx={{ borderRadius: '12px', boxShadow: 3 }}>
                <CardContent>
                  {activitySuggestions.split('\n').map((suggestion, index) => (
                    <Typography key={index} variant="body2" color="text.primary" sx={{ mb: 1, fontSize: '16px' }}>
                      {getEmojiForSuggestion(suggestion)} {suggestion}
                    </Typography>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          </Grow>
        </Grid>
      </Box>
      {/* <Snackbar open={showModal} autoHideDuration={6000} onClose={() => setShowModal(false)}>
  <Alert
    onClose={() => setShowModal(false)}
    severity={modalContent.type === "badge" ? "info" : "success"}
    sx={{ width: '100%' }}
  >
    {modalContent.type === "badge" ? (
      <>
        🎉 Félicitations ! Vous avez obtenu le badge : <strong>{modalContent.value}</strong> 🏅
      </>
    ) : (
      <>
        🎉 Vous avez gagné <strong>{modalContent.value} points</strong> ! 🚀
      </>
    )}
  </Alert>
</Snackbar> */}
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarMessage.includes("Erreur") ? "error" : "success"}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ScheduleUpload;