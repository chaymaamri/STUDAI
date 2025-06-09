import React, { useContext } from "react";
import { Container, Grid, Card, CardMedia, CardContent, Typography, CardActions, Button, Box } from "@mui/material";
import { Link, useNavigate } from 'react-router-dom';
import { motion } from "framer-motion"; // Import Framer Motion
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import "@fontsource/poppins"; // Import Google Font
import './BodyText.css'; // Importer le fichier CSS
import { AuthContext } from "../context/AuthContext"; // Importer AuthContext

const features = [
  { title: "Schedule", img: "/ai-logo/11.png", desc: "Import your schedule and get revision suggestions", link: "/emplois", className: "feature-image" },
  { title: "To‑do List", img: "/ai-logo/7.png", desc: "Organize your tasks and daily goals and get activity suggestions", link: "/todo", className: "feature-image" },
  { title: "Document Sharing", img: "/ai-logo/10.png", desc: "Share PDFs, lectures, and photos with the community", link: "/documents", className: "feature-image" },
  { title: "Academic Chat", img: "/ai-logo/8.png", desc: "Ask your questions and get instant support", link: "/ChatAcad", className: "feature-image" },
  { title: "PDF Summarizer", img: "/ai-logo/9.png", desc: "Generate course summaries with key points", link: "/courses", className: "feature-image" },
  { title: "Dashboard & Leaderboard", img: "/ai-logo/12.png", desc: "Track your progress and compare with others", link: "/dashboard", className: "feature-image" }

];


function BodyText() {
  const { isLoggedIn } = useContext(AuthContext); // Accéder à isLoggedIn depuis AuthContext
  const navigate = useNavigate(); // Hook pour naviguer

  const handleButtonClick = () => {
    if (isLoggedIn) {
      navigate("/emplois"); // Rediriger vers Emploi du temps si connecté
    } else {
      navigate("/signin"); // Rediriger vers Signin si non connecté
    }
  };

  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: false,
  };

  return (
    <main style={{ fontFamily: "Poppins, sans-serif" }}>
      {/* Texte et bouton */}
      <div className="image-text-container">
      <h3 className="text">
  Welcome to STUDAI<br /> your key to academic success
</h3>

      </div>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "7vh",
        }}
      >
        <button className="button" onClick={handleButtonClick}>
        Try Now
          <svg className="icon" viewBox="0 0 24 24" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 10-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z"
              clipRule="evenodd"
            ></path>
          </svg>
        </button>
      </Box>

    
      {/* Carousel */}
      <Container sx={{ my: 4 }}>
  <Slider {...carouselSettings}>
    {features.map((f, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: i * 0.2 }}
      >
        <Box
          sx={{
            display: "flex", // Flexbox pour aligner horizontalement
            flexDirection: { xs: "column", md: "row" }, // Colonne sur mobile, ligne sur desktop
            alignItems: "center", // Centrer verticalement
            gap: 3, // Espacement entre l'image et le texte
            p: 4, // Padding autour du contenu
            backgroundColor: "rgba(0, 0, 0, 0.3)", // Fond sombre et transparent
            borderRadius: "12px", // Coins arrondis
            // boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)", // Ombre subtile
            color: "#fff", // Texte en blanc pour contraste
          }}
        >
          {/* Image à gauche */}
          <CardMedia
            component="img"
            image={f.img}
            alt={f.title}
            sx={{
              width: { xs: "100%", md: "300px" }, // Largeur adaptative
              height: "auto", // Garde les proportions
              objectFit: "contain", // Ajuste l'image sans la déformer
              borderRadius: "8px", // Coins arrondis pour l'image
            }}
          />

          {/* Texte à droite */}
          <Box sx={{ flex: 1, textAlign: { xs: "center", md: "left" } }}>
            <Typography
              variant="h4" // Texte plus grand
              sx={{ fontWeight: "bold", mb: 2 }}
            >
              {f.title}
            </Typography>
            <Typography
              variant="h6" // Texte secondaire plus grand
              sx={{ color: "rgba(255, 255, 255, 0.8)" }}
            >
              {f.desc}
            </Typography>
          </Box>
        </Box>
      </motion.div>
    ))}
  </Slider>
</Container>
      {/* Grid des fonctionnalités */}
      <Container sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {features.map((f, i) => (
            <Grid item key={i} xs={12} sm={6} md={4}>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileHover={{ scale: 1.05 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
              >
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    "&:hover": { boxShadow: "0 6px 30px rgba(0,0,0,0.2)" },
                  }}
                >
                  <CardMedia
  component="img"
  image={f.img}
  alt={f.title}
  sx={{
    width: "150px", // Ajuste la largeur selon tes besoins
    height: "150px", // Ajuste la hauteur selon tes besoins
    objectFit: "contain", // Garde les proportions
    margin: "0 auto", // Centre l'image horizontalement
    paddingTop: "16px", // Ajoute un espace en haut si nécessaire
  }}
/>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" sx={{ fontWeight: "bold" }}>
                      {f.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {f.desc}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      component={Link}
                      to={f.link}
                      sx={{
                        color: "#1e88e5",
                        fontWeight: "bold",
                        "&:hover": { color: "#1565c0" },
                      }}
                    >
                      Access →
                    </Button>
                  </CardActions>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </main>
      
  );

}

export default BodyText;