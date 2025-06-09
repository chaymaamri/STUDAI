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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useDropzone } from "react-dropzone";
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import Loaders from "./Loaders";
import "./ScheduleUpload.css";


function CourseUpload() {
  const [files, setFiles] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showPointsModal, setShowPointsModal] = useState(false); // État pour afficher la modal
const [pointsEarned, setPointsEarned] = useState(0); // État pour les points gagnés
const [actionType, setActionType] = useState(""); // "import" ou "summary"


  const onDrop = (acceptedFiles) => {
    setFiles([...files, ...acceptedFiles]);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

 
  const handleUpload = async () => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append("pdfs", file);
    });
    const storedUser = JSON.parse(localStorage.getItem("user"));
    formData.append("userId", storedUser.id);
    setLoading(true);
  
    try {
      const response = await axios.post("http://localhost:5000/api/upload-courses", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      console.log("Server response:", response.data);
      setSnackbarMessage("Upload successful!");
      setOpenSnackbar(true);
      setPointsEarned(10); // Points gagnés pour l'importation
      setActionType("import"); // Définir le type d'action
      setShowPointsModal(true); // Afficher la modal
      fetchCourses();
    } catch (error) {
      console.error("Upload error :", error);
      setSnackbarMessage("Upload failed!");
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser || !storedUser.id) {
      console.error("❌ Error: User ID not found.");
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5000/api/courses/${storedUser.id}`);
      setCourses(response.data.courses);
    } catch (error) {
      console.error("❌ Error fetching courses:", error);
      setCourses([]);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDelete = async (courseId) => {
    try {
      await axios.delete(`http://localhost:5000/api/courses/${courseId}`);
      setSnackbarMessage("Course deleted successfully!");
      setOpenSnackbar(true);
      fetchCourses();
    } catch (error) {
      console.error("Error deleting course:", error);
      setSnackbarMessage("Error deleting course!");
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleOpenDialog = (course) => {
    setSelectedCourse(course);
    setOpenDialog(true); 
    const storedUser = JSON.parse(localStorage.getItem("user"));
    axios.post("http://localhost:5000/api/courses/summary-view", {
      userId: storedUser.id,
      courseId: course.id
    })
    .then((response) => {
      console.log(response.data.message);
      setPointsEarned(5); // Points gagnés pour la consultation
      setActionType("summary"); // Définir le type d'action
      setShowPointsModal(true); // Afficher la modal
    })
    .catch((error) => {
      console.error("Error viewing summary:", error);
    });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCourse(null);
  };

  return (
    <Box sx={{ p: 2 }}>
     <Dialog
  open={showPointsModal}
  onClose={() => setShowPointsModal(false)}
  sx={{ zIndex: 2000 }}
>
  <DialogTitle sx={{ textAlign: "center" }}>
  🎉 Congratulations! 🎉
  </DialogTitle>
  <DialogContent sx={{ textAlign: "center" }}>
    <Typography variant="h6">
    {actionType === "import" && (
              <>You earned {pointsEarned} points for uploading a course!</>
            )}
            {actionType === "summary" && (
              <>You earned {pointsEarned} points for viewing a summary!</>
            )}
    </Typography>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setShowPointsModal(false)} color="primary">
      Close
    </Button>
  </DialogActions>
</Dialog>
      <Typography variant="h5" gutterBottom>
      Upload your courses
      </Typography>
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
            {files.length > 0 ? files.map(file => file.name).join(", ") : "📂 Upload your courses"}
          </label>
        </div>
      </Box>
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
          disabled={files.length === 0}
        >
          Upload
        </Button>
        {files.length > 0 && (
          <IconButton
            color="secondary"
            onClick={() => setFiles([])}
            sx={{ ml: 2 }}
          >
            <DeleteIcon />
          </IconButton>
        )}
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          📚 Your courses
        </Typography>
        {loading && <Loaders />}
        <Grid container spacing={2}>
          {courses.map((course, index) => (
            <Grow in={true} key={index} timeout={1000}>
              <Grid item xs={12} sm={6} md={4}>
                <Card variant="outlined" sx={{ borderRadius: '12px', boxShadow: 3 }}>
                  <CardContent>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                      {course.title}
                    </Typography>
                    <Typography variant="body2" color="text.primary" sx={{ mt: 1, fontSize: '16px' }}>
                      {course.summary}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleOpenDialog(course)}
                      >
                        View key points
                      </Button>
                      <IconButton
                        color="primary"
                        onClick={() => handleDelete(course.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grow>
          ))}
        </Grid>
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
        Key points
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {selectedCourse && selectedCourse.keyPoints && selectedCourse.keyPoints.map((point, index) => (
              <Grow in={true} key={index} timeout={1000}>
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ borderRadius: '12px', boxShadow: 3 }}>
                    <CardContent>
                      <Typography variant="body1" color="text.primary">
                        {point}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grow>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
          Close
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarMessage.includes("Erreur") ? "error" : "success"}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default CourseUpload;