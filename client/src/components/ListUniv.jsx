import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { CardMedia, Alert, LinearProgress } from "@mui/material";
import { Link } from "react-router-dom"; // Importer Link pour la navigation
import axios from "axios";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  color: theme.palette.text.secondary,
}));

function ListUniv() {
  // States
  const [rectorat, setRectorat] = useState("");
  const [university, setUniversity] = useState("");
  const [image, setImage] = useState(null);
  const [universities, setUniversities] = useState({});
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUniversities = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "http://localhost:5000/api/universities"
        );
        const fetchedUniversities = response.data;

        // Organiser les universités par rectorat
        const organizedUniversities = {};
        fetchedUniversities.forEach((univ) => {
          if (!organizedUniversities[univ.rectorat]) {
            organizedUniversities[univ.rectorat] = [];
          }
          organizedUniversities[univ.rectorat].push({
            name: univ.university,
            image: univ.image,
          });
        });
        setUniversities(organizedUniversities);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des universités :",
          error
        );
        setAlert("Erreur lors de la récupération des universités.");
      } finally {
        setLoading(false); // Arrêter le chargement
      }
    };

    fetchUniversities();

    // Récupérer les universités du localStorage
    const storedUniversities = JSON.parse(localStorage.getItem("universities"));
    if (storedUniversities) {
      setUniversities(storedUniversities);
    }
  }, []);
   // Fonction pour convertir une image en base64
   const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Gérer le téléchargement de l'image
  const handleImageUpload = async (event) => {
    const uploadedImage = event.target.files[0];
    if (uploadedImage) {
      const base64Image = await convertToBase64(uploadedImage);
      setImage(base64Image);
    }
  };

  // Data des rectorats et universités
  const rectorats = {
    "Université de Tunis": [
      "Université de Tunis",
      "Faculté des Sciences Humaines et Sociales de Tunis",
      "Ecole Supérieure des Sciences Economiques et Commerciales de Tunis",
      "Ecole Normale Supérieure",
      "Ecole Supérieure des Sciences et Techniques de Tunis",
      "Institut Préparatoire aux Etudes d'Ingénieurs de Tunis",
      "Institut Préparatoire aux Etudes Littéraires et de Sciences Humaines de Tunis",
      "Institut Supérieur de Gestion de Tunis",
      "Institut Supérieur de l'Education et de la Formation Continue",
      "Institut Supérieur des Beaux Arts de Tunis",
      "Institut Supérieur de Musique",
      "Institut Supérieur d'Art Dramatique",
      "Institut Supérieur des Sciences Culturelles et Métiers du Patrimoine de Tunis",
      "Institut Supérieur des Etudes Appliquées en Humanités de Tunis",
      "Institut Supérieur de l'Animation pour la Jeunesse et la Culture",
      "Institut Supérieur des Études Appliquées en Humanités de Zaghouan",
      "Institut National du Patrimoine",
      "Tunis Business School",
    ],
    "Université de Carthage": [
      "Université de Carthage",
      "Faculté des Sciences Juridiques, Politiques et Sociales de Tunis",
      "Faculté des Sciences de Bizerte",
      "Institut Supérieur de Gestion de Bizerte",
      "Faculté des Sciences Economiques et de Gestion de Nabeul",
      "Ecole Nationale d'Architecture et d'Urbanisme de Tunis",
      "Ecole Polytechnique de Tunisie",
      "Ecole Supérieure de Technologie et d'Informatique à Carthage",
      "Ecole Supérieure des Statistiques et d'Analyse de l'Information",
      "Ecole Supérieure de l'Audiovisuel et du Cinéma de Gammarth",
      "Institut Préparatoire aux Etudes d'Ingénieur de Bizerte",
      "Institut des Hautes Etudes Commerciales de Carthage",
      "Institut National des Sciences Appliquées et de Technologie",
      "Institut Supérieur des Sciences Appliquées et de la Technologie de Mateur",
      "Institut Préparatoire aux Etudes d'Ingénieur Nabeul",
      "Institut Préparatoire aux Etudes Scientifiques et Techniques de la Marsa",
      "Institut Supérieur des Beaux Arts de Nabeul",
      "Institut Supérieur des Technologies de l'Environnement, de L'Urbanisme et du Bâtiment",
      "Institut Supérieur des Langues de Tunis",
      "Institut Supérieur des Langues Appliquées et d'Informatique de Nabeul",
      "Institut Supérieur des Sciences et Technologies de l'Environnement de Borj Cédria",
      "Institut Supérieur de Commerce et de Comptabilité de Bizerte",
      "Institut Supérieur des Etudes Préparatoires en Biologie et Géologie à Soukra",
      "Sup'Com",
      "Ecole Supérieure d'Agriculture de Mograne",
      "Ecole Supérieure d'Agriculture de Mateur",
      "Ecole Supérieure des Industries Alimentaires de Tunis",
      "Institut Supérieur de Pêche et d'Aquaculture de Bizerte",
      "Institut National du Travail et des Etudes Sociales de Tunis",
      "Institut Supérieur des Cadres de l'Enfance",
      "Institut National Agronomique de Tunisie",
      "Institut des Hautes Etudes Touristiques de Sidi Dhrif",
      "Institut National de Recherche en Génie Rural, Eau et Forêt",
      "Institut National de Recherche Agronomique de Tunis",
    ],
    "Université de Sousse": [
      "Université de Sousse",
      "Faculté de Droit et des Sciences Economiques et Politiques de Sousse",
      "Faculté de Médecine de Sousse",
      "Faculté des Lettres et des Sciences Humaines de Sousse",
      "Institut Supérieur de Finance et de Fiscalité de Sousse",
      "Institut Supérieur d'Informatique et des Technologies de Communication de Hammam Sousse",
      "Institut Supérieur du Transport et de la Logistique de Sousse",
      "Institut Supérieur de Beaux Arts de Sousse",
      "Ecole Supérieure des Sciences et Techniques de la Santé de Sousse",
      "Institut Supérieur de Gestion de Sousse",
      "Institut des Hautes Etudes Commerciales de Sousse",
      "Institut Supérieur de Musique de Sousse",
      "Institut Supérieur des Sciences Appliquées et de Technologie de Sousse",
      "Ecole Nationale d’Ingénieurs de Sousse",
      "Institut Supérieur Agronomique de Chott Mériem",
      "Institut Supérieur des Sciences infirmières de Sousse",
      "Ecole Supérieure des Sciences et des technologies de Hammam Sousse",
    ],
    "Université de Sfax": [
      "Université de Sfax",
      "Faculté des Sciences Economiques et de Gestion de Sfax",
      "Faculté de Médecine de Sfax",
      "Faculté de droit de Sfax",
      "Institut Supérieur des Arts et Métiers de Sfax",
      "Institut Supérieur d'Electronique et de Communication de Sfax",
      "Institut Supérieur de Gestion Industrielle de Sfax",
      "Institut des Hautes Etudes Commerciales de Sfax",
      "Faculté des Sciences de Sfax",
      "Ecole Nationale d'Ingénieurs de Sfax",
      "Ecole Supérieure de Commerce de Sfax",
      "Institut Supérieur d'Administration des Affaires de Sfax",
      "Institut Supérieur d'Informatique et de Multimédia de Sfax",
      "Institut Supérieur de Musique de Sfax",
      "Institut Préparatoire aux Etudes d'Ingénieurs de Sfax",
      "Institut Supérieur du Sport et de l'Education Physique de Sfax",
      "Institut Supérieur de Biotechnologies de Sfax",
      "Faculté des Lettres et Sciences Humaines de Sfax",
      "Institut Zitouna de Sfax",
      "Ecole Supérieure des Sciences et Techniques de la Santé de Sfax",
      "Institut Supérieur des Sciences infirmières de Sfax",
    ],
    "Université de Ez-Zitouna": [
      "L'Université de Ez-Zitouna",
      "Institut Supérieur de Théologie de Tunis",
      "Institut Supérieur de Civilisation Islamique de Tunis",
      "Centre de Études Islamiques de Kairouan",
    ],
    "Université de la Manouba": [
      "Université de la Manouba",
      "Faculté des Lettres, des Arts et des Humanités de la Manouba",
      "Ecole Supérieure des Sciences et Technologies du Design",
      "Ecole Supérieure de Commerce de Tunis",
      "Ecole Supérieure de Commerce Electronique de la Manouba",
      "Ecole Nationale des Sciences de l'Informatique",
      "Institut Supérieur des Arts du Multimédia de la Manouba",
      "Institut Supérieur de Comptabilité et d'Administration des Entreprises",
      "Institut Supérieur de Biotechnologie de Sidi Thabet",
      "Institut Supérieur de Documentation de Tunis",
      "Institut de Presse et des Sciences de l'Information",
      "Ecole Nationale de Médecine Vétérinaire de Sidi Thabet",
      "Institut Supérieur du Sport et de l'Education Physique de Ksar Saïd",
      "Institut Supérieur de Promotion des Handicapés de Ksar Saïd",
      "Institut Supérieur de l'Histoire de la Tunisie Contemporaine",
    ],
    "Université de Monastir": [
      "Université de Monastir",
      "Faculté des Sciences de Monastir",
      "Faculté de Médecine de Monastir",
      "Institut Supérieur d'Informatique et de Mathématiques de Monastir",
      "Faculté de Médecine Dentaire de Monastir",
      "Faculté de Pharmacie de Monastir",
      "Faculté des Sciences Economiques et de Gestion de Mahdia",
      "Ecole Nationale d'Ingénieurs de Monastir",
      "Institut Supérieur de Biotechnologie de Monastir",
      "Institut Préparatoire aux Etudes d'Ingénieurs de Monastir",
      "Ecole Supérieure des Sciences et Techniques de la Santé de Monastir",
      "Institut Supérieur des Etudes Appliquées en Humanités de Mahdia",
      "Institut Supérieur des Métiers de la Mode de Monastir",
      "Institut Supérieur d'Informatique de Mahdia",
      "Institut Supérieur des Arts et Métiers de Mahdia",
      "Institut Supérieur des Sciences Appliquées et de Technologie de Mahdia",
      "Institut Supérieur des Langues Appliquées aux Affaires et au Tourisme de Moknine",
    ],
    "Université de Gafsa": [
      "Université de Gafsa",
      "Faculté des Sciences de Gafsa",
      "Institut Supérieur des Etudes Appliquées en Humanités de Gafsa",
      "Institut Supérieur d'Administration des Entreprises de Gafsa",
      "Institut Supérieur des Sciences Appliquées et de Technologie de Gafsa",
      "Institut Supérieur d'Arts et Métiers de Gafsa",
      "Institut Supérieur des Sciences et des Technologies de l’énergie de Gafsa",
      "Institut Supérieur des Etudes Appliquées en Humanités de Tozeur",
      "Institut Préparatoire aux Etudes d’Ingénieur de Gafsa",
      "Institut Supérieur du Sport et de l’Education Physique de Gafsa",
    ],
    "Instituts Supérieurs des Etudes Technologiques": [
      "Institut Supérieur des Etudes Technologiques de Sfax",
      "Institut Supérieur des Etudes Technologiques de Kebili",
      "Institut Supérieur des Etudes Technologiques de Gabès",
      "Institut Supérieur des Etudes Technologiques de Djerba",
      "Institut Supérieur des Etudes Technologiques de Kef",
      "Institut Supérieur des Etudes Technologiques de Zaghouan",
      "Institut Supérieur des Etudes Technologiques de Sousse",
      "Institut Supérieur des Etudes Technologiques de Mahdia",
      "Institut Supérieur des Etudes Technologiques de Siliana",
      "Institut Supérieur des Etudes Technologiques de Radès",
      "Institut Supérieur des Etudes Technologiques de Nabeul",
      "Institut Supérieur des Etudes Technologiques de Sidi Bouzid",
      "Institut Supérieur des Etudes Technologiques en Communications (El Ghazala)",
      "Institut Supérieur des Etudes Technologiques de Kairouan",
      "Institut Supérieur des Etudes Technologiques de Gafsa",
      "Institut Supérieur des Etudes Technologiques de Béja",
      "Institut Supérieur des Etudes Technologiques de Charguia",
      "Institut Supérieur des Etudes Technologiques de Jendouba",
      "Institut Supérieur des Etudes Technologiques de Kasserine",
      "Institut Supérieur des Etudes Technologiques de Ksar Hellal",
      "Institut Supérieur des Etudes Technologiques de Tataouine",
      "Institut Supérieur des Etudes Technologiques de Tozeur",
      "Institut Supérieur des Etudes Technologiques de Bizerte",
      "Institut Supérieur des Etudes Technologiques de Médenine",
    ],
    "Université de Tunis El Manar": [
      "Université de Tunis El Manar",
      "Faculté de Droit et des Sciences Politiques de Tunis",
      "Faculté des Sciences Economiques et de Gestion de Tunis",
      "Faculté des sciences de Tunis",
      "Faculté de Médecine de Tunis",
      "Ecole Nationale d'Ingénieurs de Tunis",
      "Institut Bourguiba des Langues Vivantes",
      "Institut Préparatoire aux Etudes d'Ingénieurs d'El Manar",
      "Institut Supérieur des Sciences Biologiques Appliquées",
      "Institut Supérieur d'Informatique d'El Manar",
      "Institut Supérieur des Sciences Humaines de Tunis",
      "Institut Supérieur des Technologies Médicales",
      "Ecole Supérieure des Sciences et Techniques de la Santé de Tunis",
      "Institut Supérieur des Sciences infirmières de Tunis",
      "Institut Pasteur",
      "Institut de Recherche Vétérinaire de Tunis",
    ],
    "Université de Jendouba": [
      "Université de Jendouba",
      "Faculté des Sciences Juridiques, Economiques et de Gestion de Jendouba",
      "Institut Supérieur des Etudes Appliquées en Humanités du Kef",
      "Institut Supérieur des Langues Appliquées et d'Informatique de Béja",
      "Institut Supérieur des Sciences Humaines de Jendouba",
      "Institut Supérieur des Arts et Métiers de Siliana",
      "Institut Supérieur de Musique et de Théâtre du Kef",
      "Institut Supérieur de l'Éducation Physique du Kef",
      "Ecole Supérieure d'Agriculture du Kef",
      "Institut Sylvo-Pastoral de Tabarka",
      "Ecole Supérieure des Ingénieurs de l'Equipement Rural de Medjez El Bab",
      "Institut supérieur de l'informatique du Kef",
      "Institut supérieur de biotechnologie de Béja",
      "Institut Supérieur des Sciences infirmières du Kef",
    ],
    "Université de Kairouan": [
      "Université de Kairouan",
      "Faculté des Lettres et des Sciences Humaines de Kairouan",
      "Institut Supérieur des Arts et Métiers de Kairouan",
      "Institut Supérieur d'Informatique et de Gestion de Kairouan",
      "Institut Supérieur des Etudes Juridiques et Politiques de Kairouan",
      "Institut Supérieur des Sciences Appliquées et de Technologie de Kairouan",
      "Institut Supérieur des Arts et Métiers de Kasserine",
      "Institut Supérieur des Mathématiques Appliquées et de l'Informatique de Kairouan",
      "Institut Supérieur des Etudes Appliquées en Sciences Humaines de Sbeïtla",
      "Institut Supérieur des Arts et Métiers de Sidi Bouzid",
    ],
    "Université de Gabès": [
      "Université de Gabès",
      "Faculté des Sciences de Gabès",
      "Ecole Nationale d'Ingénieurs de Gabès",
      "Institut Supérieur de Gestion de Gabès",
      "Institut Supérieur des Langues de Gabès",
      "Institut Supérieur des Arts et Métiers de Gabès",
      "Institut Supérieur de Biologie Appliquée de Medenine",
      "Institut Supérieur des Etudes Juridiques de Gabès",
      "Institut Supérieur d'Informatique et de Multimédia de Gabès",
      "Institut Supérieur des Sciences Appliquées et de Technologie de Gabès",
      "Institut Supérieur des Sciences et Techniques des Eaux de Gabès",
      "Institut Supérieur des Systèmes Industriels de Gabès",
      "Institut Supérieur des Etudes Appliquées en Humanités de Médenine",
      "Institut Supérieur d'Informatique de Medenine",
      "Institut Supérieur des Arts et Métiers de Tataouine",
      "Institut Supérieur des Sciences infirmières de Gabès",
    ], 
    // ... (vos données Universités ici)
  };

 

  // Ajouter une université
  const handleSubmit = async () => {
    if (rectorat && university && image) {
      try {
        const newUniversity = {
          rectorat,
          university,
          image,
        };

        // Envoyer les données à l'API
        await axios.post(
          "http://localhost:5000/api/universities",
          newUniversity
        );

        // Mettre à jour l'état local pour afficher la nouvelle université
        setUniversities((prev) => {
          const updated = { ...prev };
          if (!updated[rectorat]) {
            updated[rectorat] = [];
          }
          updated[rectorat].push({ name: university, image });
          return updated;
        });

        // Stocker les universités dans le localStorage
        localStorage.setItem(
          "universities",
          JSON.stringify({
            ...universities,
            [rectorat]: [
              ...(universities[rectorat] || []),
              { name: university, image },
            ],
          })
        );

        // Réinitialiser les champs du formulaire
        setUniversity("");
        setRectorat("");
        setImage(null);
        setAlert(null);
      } catch (error) {
        console.error("Erreur lors de l'ajout de l'université :", error);
        setAlert("Erreur lors de l'ajout de l'université. Veuillez réessayer.");
      }
    } else {
      setAlert("Veuillez remplir tous les champs et ajouter une image.");
    }
  };
  return (
    <>
      <Grid container spacing={2}>
        {/* Alert message */}
        {alert && (
          <Grid item xs={12}>
            <Alert severity="warning" onClose={() => setAlert(null)}>
              {alert}
            </Alert>
          </Grid>
        )}

        {/* Zone d'affichage des universités classées par rectorat */}
        <Grid item xs={12} md={8}>
          <Typography variant="h4" gutterBottom>
             Etablissement Classées par Universités
          </Typography>
          {loading ? (
            <LinearProgress /> // Afficher la barre de progression pendant le chargement
          ) : Object.keys(universities).length === 0 ? (
            <Typography variant="body1">Aucune université ajoutée.</Typography>
          ) : (
            Object.entries(universities).map(([rectorat, univs], idx) => (
              <Grid item xs={12} key={idx}>
                <Typography variant="h5" color="primary" gutterBottom>
                  {rectorat}
                </Typography>
                <Grid container spacing={2}>
                  {univs.map((univ, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card>
                        <CardMedia
                          component="img"
                          height="140"
                          image={univ.image}
                          alt={`Image de ${univ.name}`}
                        />
                        <CardContent>
                          <Typography variant="h6">
                            <Link
                              to={`/universite/${univ.name}`}
                              style={{
                                textDecoration: "none",
                                color: "inherit",
                              }}
                            >
                              {univ.name}
                            </Link>
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            ))
          )}
        </Grid>

        {/* Formulaire */}
        <Grid item xs={12} md={4}>
          <Item>
            <Typography variant="h6">Ajouter une Etablissement</Typography>
            <TextField
              select
              label="Université"
              value={rectorat}
              onChange={(e) => setRectorat(e.target.value)}
              fullWidth
              variant="standard"
            >
              {Object.keys(rectorats).map((rectorat) => (
                <MenuItem key={rectorat} value={rectorat}>
                  {rectorat}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Etablissement"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              fullWidth
              variant="standard"
              disabled={!rectorat}
            >
              {rectorat &&
                rectorats[rectorat].map((univ) => (
                  <MenuItem key={univ} value={univ}>
                    {univ}
                  </MenuItem>
                ))}
            </TextField>
            <label
              htmlFor="upload-image"
              style={{ cursor: "pointer", textAlign: "left" }}
            >
              <Typography variant="body2">Ajouter une image</Typography>
              <input
                id="upload-image"
                type="file"
                style={{ display: "none" }}
                onChange={handleImageUpload}
              />
            </label>
            <Button variant="contained" onClick={handleSubmit}>
              Ajouter
            </Button>
          </Item>
        </Grid>
      </Grid>
    </>
  );
}

export default ListUniv;
