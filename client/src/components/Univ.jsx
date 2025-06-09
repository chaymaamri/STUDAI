import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // Importer Link pour la navigation
import { Card, CardContent, Typography, TextField, Button, Grid } from '@mui/material';

const Univ = () => {
  const { name } = useParams(); // Récupérer le nom de l'université à partir de l'URL
  const [level, setLevel] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [classes, setClasses] = useState([]); // État pour stocker les classes ajoutées
  //const [image, setImage] = useState(null); // État pour stocker l'image de l'université

  useEffect(() => {
    // Récupérer les universités du localStorage
    const storedUniversities = JSON.parse(localStorage.getItem("universities"));
    console.log("Stored Universities:", storedUniversities); // Log des universités stockées

    if (storedUniversities) {
      // Trouver l'université correspondante
      for (const rectorat in storedUniversities) {
        const university = storedUniversities[rectorat].find((univ) => univ.name === name);
        if (university) {
          console.log("University Found:", university); // Log de l'université trouvée
          //setImage(university.image); // Récupérer l'image de l'université
          break;
        }
      }
    }
  }, [name]);
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/classes');
        if (response.ok) {
          const data = await response.json();
          setClasses(data.filter(cls => cls.universityName === name)); // Filtrer par nom d'université
        } else {
          console.error('Erreur lors de la récupération des classes');
        }
      } catch (error) {
        console.error('Erreur de réseau:', error);
      }
    };

    fetchClasses();
  }, [name]); // Dépendance sur le nom de l'université

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (level && specialty) {
      const newClass = { level, specialty, universityName: name };
  
      // Envoyer la classe au serveur
      try {
        const response = await fetch('http://localhost:5000/api/classes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newClass),
        });
  
        if (response.ok) {
          const savedClass = await response.json();
          setClasses([...classes, savedClass]);
          setLevel('');
          setSpecialty('');
        } else {
          console.error('Erreur lors de l\'ajout de la classe');
        }
      } catch (error) {
        console.error('Erreur de réseau:', error);
      }
    }
  };

  return (
    <Grid container spacing={2}>
      {/* Zone d'affichage de l'image de l'université */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h4">{name}</Typography>
            {/* <img
              src={image || `${process.env.PUBLIC_URL}/images/default.jpg`} // Utiliser l'image récupérée ou une image par défaut
              alt={name}
              style={{ width: '100%', height: 'auto' }}
            /> */}
          </CardContent>
        </Card>
        <Typography variant="h6" style={{ marginTop: '16px' }}>
          Classes Ajoutées:
        </Typography>
        {classes.length === 0 ? (
          <Typography variant="body2">Aucune classe ajoutée.</Typography>
        ) : (
          classes.map((cls, index) => (
            <Card key={index} style={{ marginTop: '8px', padding: '8px' }}>
              <Link to="/documents" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Typography variant="body1">
                  {cls.level} - {cls.specialty}
                </Typography>
              </Link>
            </Card>
          ))
        )}
      </Grid>

      {/* Formulaire à droite */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6">Ajouter une Classe</Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                label="Niveau"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                fullWidth
                required
              />
              <TextField
                label="Spécialité"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                fullWidth
                required
              />
              <Button type="submit" variant="contained" color="primary" style={{ marginTop: '16px' }}>
                Ajouter Classe
              </Button>
            </form>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default Univ;