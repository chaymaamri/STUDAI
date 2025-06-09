import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  TextField,
  Button,
  LinearProgress,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Snackbar,
  IconButton,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  DialogContentText,
} from "@mui/material";

import DriveFolderUploadIcon from "@mui/icons-material/DriveFolderUpload";
import SendIcon from "@mui/icons-material/Send";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DeleteIcon from "@mui/icons-material/Delete";

import Down from "./Down"; // Votre composant de téléchargement

// Petite fonction utilitaire pour grouper
function groupBy(array, key) {
  const grouped = {};
  array.forEach((item) => {
    const groupValue = item[key] || "Unknown";
    if (!grouped[groupValue]) {
      grouped[groupValue] = [];
    }
    grouped[groupValue].push(item);
  });
  return grouped;
}

const StyledWrapper = styled.div`
  .card {
    width: 100%;
    max-width: 1000px;
    background: #ffffff;
    box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.1);
    border-radius: 11px;
    margin: 0 auto 20px;
    padding-bottom: 20px;
    position: relative;
  }

  .loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
  }

  .search-container {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 20px 20px 10px;
  }

  .search-container input {
    width: 100%;
    height: 50px;
    border: 0;
    outline: none;
    font-size: 14px;
    background-color: #f8f8f8;
    border-radius: 8px;
    padding: 0 10px;
  }

  .filters {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 20px 20px;
  }

  .filters button {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    padding: 8px 15px;
    background: #ffffff;
    border: 1px solid #e5e5e5;
    border-radius: 20px;
    font-weight: 600;
    color: #171718;
    cursor: pointer;
    transition: all 0.6s cubic-bezier(0.15, 0.83, 0.66, 1);
  }

  .filters button:hover {
    transform: scale(1.05) translateY(-3px);
    box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1);
  }

  .results {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 0 20px;
  }

  .results .label {
    font-weight: 600;
    font-size: 14px;
    color: #5f6368;
    margin-bottom: 5px;
  }

  .results-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .entry {
    display: grid;
    grid-template-columns: 40px 1fr 80px; /* On élargit un peu la 3e colonne */
    gap: 12px;
    padding: 5px 0;
    transition: background-color 0.2s ease-in;
    border-radius: 8px;
  }

  .entry:hover {
    background-color: #f5f8fe;
  }

  .entry .icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #ececec;
    border-radius: 7px;
  }

  .entry .desc {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .desc label {
    font-weight: 600;
    font-size: 13px;
    color: #171718;
    margin-bottom: 3px;
  }

  .desc span {
    font-size: 12px;
    color: #72767c;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 5px; /* Espacement entre les icônes */
  }

  .upload-form {
    margin: 10px 20px 0;
    padding: 15px;
    background: #f2f2f2;
    border-radius: 8px;
  }

  .upload-field {
    margin-bottom: 10px;
  }

  .upload-button-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }

  @media (max-width: 768px) {
    .card {
      width: 90%;
      padding-bottom: 15px;
    }
    .search-container input {
      height: 40px;
      font-size: 12px;
    }
    .filters button {
      padding: 6px 10px;
      font-size: 12px;
    }
    .entry .desc label {
      font-size: 12px;
    }
    .desc span {
      font-size: 11px;
    }
  }
`;

function Documents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [fileName, setFileName] = useState("");
  const [description, setDescription] = useState("");
  const [speciality, setSpeciality] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [alert, setAlert] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  

  // Pour la gestion du popup de suppression
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      try {
        const storedUser = localStorage.getItem("user");
        let userId = null;
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          userId = parsedUser.id;
          setCurrentUserId(userId);
        }
        const url = userId ? `/api/files?userId=${userId}` : `/api/files`;
        const response = await fetch(url);
        const data = await response.json();
        setFileList(data);
      } catch (error) {
        console.error("Error fetching files:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, []);

  // Filtrage
  const filteredFiles = fileList.filter((file) => {
    const matchSearch =
      (file.name ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (file.description ?? "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (file.nomPrenom ?? "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (file.etablissement ?? "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (file.specialite ?? "").toLowerCase().includes(searchQuery.toLowerCase());

    return matchSearch;
  });

  let groupedData = null;
  if (activeFilter === "etablissement") {
    groupedData = groupBy(filteredFiles, "etablissement");
  } else if (activeFilter === "specialite") {
    groupedData = groupBy(filteredFiles, "specialite");
  }

  // Sélection fichier
  const handleFileUpload = (e) => {
    const uploaded = e.target.files[0];
    if (uploaded) {
      setSelectedFile(uploaded);
    }
  };

  // Soumission
  const handleSubmit = async () => {
    if (fileName && description && speciality && selectedFile) {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        setAlert("No user found in the location (not connected?).");
        return;
      }

      let userId = null;
      try {
        const parsedUser = JSON.parse(storedUser);
        userId = parsedUser.id;
      } catch (err) {
        console.error("User's parsing error :", err);
        setAlert("Impossible to recover the ID from the user.");
        return;
      } 

      if (!userId) {
        setAlert("User's ID is invalid or nonexistent.");
        return;
      }

      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("name", fileName);
      formData.append("description", description);
      formData.append("specialite", speciality);
      formData.append("file", selectedFile);

      try {
        const response = await fetch("http://localhost:5000/api/files", {
          method: "POST",
          body: formData,
        });
        if (response.ok) {
          const updatedRes = await fetch(`/api/files?userId=${userId}`);
          const updatedFiles = await updatedRes.json();
          setFileList(updatedFiles);

          setFileName("");
          setDescription("");
          setSpeciality("");
          setSelectedFile(null);
          setAlert(null);
          setShowUploadForm(false);
        } else {
          setAlert("Error when sending the file.");
        }
      } catch (error) {
        console.error("Error when sending the file:", error);
        setAlert("Error when sending the file.");
      }
    } else {
      setAlert("Please complete all fields and select a file.");
    }
  };

  // Ouvrir la boîte de dialogue de suppression
  const handleOpenDeleteDialog = (fileId) => {
    setFileToDelete(fileId);
    setOpenDeleteDialog(true);
  };

  // Fermer la boîte de dialogue
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setFileToDelete(null);
  };

  // Confirmer la suppression
  const handleConfirmDelete = async () => {
    if (!fileToDelete) return;
    try {
      const response = await fetch(`http://localhost:5000/api/files/${fileToDelete}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setFileList((prev) => prev.filter((f) => f.id !== fileToDelete));
        setAlert("uccessfully deleted file!");
      } else {
        setAlert("Error when deleting the file.");
      }
    } catch (error) {
      console.error("Error when deleting the file :", error);
      setAlert("Error when deleting the file.");
    }
    setOpenDeleteDialog(false);
    setFileToDelete(null);
  };

  return (
    <StyledWrapper>
      <div className="card">
        {/* Barre de recherche */}
        <div className="search-container">
          <input
            placeholder="Search for a document by title, description .."
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filtres */}
        <div className="filters">
          <button onClick={() => setActiveFilter("etablissement")}>
          By establishment
          </button>
          <button onClick={() => setActiveFilter("specialite")}>
          By specialty
          </button>
          <button onClick={() => setActiveFilter("")}>Show everything</button>
        </div>

        {/* Résultats */}
        <div className="results">
          <p className="label">Best Results</p>

          {loading && <LinearProgress />}

          {groupedData ? (
            Object.keys(groupedData).map((groupName) => (
              <div key={groupName} style={{ marginBottom: "20px" }}>
                <h2 style={{ margin: "20px 0 10px", color: "#333" }}>
                  {groupName}
                </h2>
                {groupedData[groupName].map((file, idx) => {
                  const isOwner = file.user_id === currentUserId;
                  return (
                    <div className="entry" key={idx}>
                      <div className="icon">
                        {file.file_type &&
                        file.file_type.startsWith("image/") ? (
                          <img
                            src={`http://localhost:5000/${file.file_path}`}
                            alt={file.name}
                            style={{ width: 40, height: 40 }}
                          />
                        ) : (
                          <PictureAsPdfIcon fontSize="small" color="error" />
                        )}
                      </div>
                      <div className="desc">
                        <label>
                          {file.name}{" "}
                          {isOwner && file.status && (
                            <span
                              style={{
                                color:
                                  file.status === "pending"
                                    ? "red"
                                    : file.status === "accepted"
                                    ? "green"
                                    : "inherit",
                                fontWeight: "bold",
                                marginLeft: "5px",
                                fontSize: "12px",
                              }}
                            >
                              {file.status.toUpperCase()}
                            </span>
                          )}
                        </label>
                        <span>{file.description}</span>
                        <span>{file.specialite}</span>
                        <span>
                          {file.nomPrenom} - {file.etablissement}
                        </span>
                      </div>

                      {/* Actions (télécharger + supprimer) sur la même ligne */}
                      <div className="actions">
                        <Down
                          href={`http://localhost:5000/${file.file_path}`}
                          filename={file.name}
                        />
                        {isOwner && (
                          <IconButton
                            color="error"
                            onClick={() => handleOpenDeleteDialog(file.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          ) : (
            <div className="results-list">
              {filteredFiles.map((file, index) => {
                const isOwner = file.user_id === currentUserId;
                return (
                  <div className="entry" key={index}>
                    <div className="icon">
                      {file.file_type &&
                      file.file_type.startsWith("image/") ? (
                        <img
                          src={`http://localhost:5000/${file.file_path}`}
                          alt={file.name}
                          style={{ width: 40, height: 40 }}
                        />
                      ) : (
                        <PictureAsPdfIcon fontSize="small" color="error" />
                      )}
                    </div>
                    <div className="desc">
                      <label>
                        {file.name}{" "}
                        {isOwner && file.status && (
                          <span
                            style={{
                              color:
                                file.status === "pending"
                                  ? "red"
                                  : file.status === "accepted"
                                  ? "green"
                                  : "inherit",
                              fontWeight: "bold",
                              marginLeft: "5px",
                              fontSize: "12px",
                            }}
                          >
                            {file.status.toUpperCase()}
                          </span>
                        )}
                      </label>
                      <span>{file.description}</span>
                      <span>{file.specialite}</span>
                      <span>
                        {file.nomPrenom} - {file.etablissement}
                      </span>
                    </div>
                    <div className="actions">
                      <Down
                        href={`http://localhost:5000/${file.file_path}`}
                        filename={file.name}
                      />
                      {isOwner && (
                        <IconButton
                          color="error"
                          onClick={() => handleOpenDeleteDialog(file.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bouton pour ouvrir le formulaire d'upload */}
        <div className="upload-button-container">
          <Button
            variant="contained"
            startIcon={<DriveFolderUploadIcon />}
            onClick={() => setShowUploadForm(!showUploadForm)}
          >
           Upload Document 
          </Button>
        </div>

        {/* Formulaire d'upload */}
        {showUploadForm && (
          <div className="upload-form">
            <h3>Share an important file, it can help others !</h3>
            {alert && (
              <Snackbar
                open={!!alert}
                autoHideDuration={6000}
                onClose={() => setAlert(null)}
                message={alert}
              />
            )}
            <TextField
              className="upload-field"
              label="File name"
              variant="outlined"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              fullWidth
            />
            <TextField
              className="upload-field"
              label="Description"
              variant="outlined"
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
            />
            <FormControl fullWidth className="upload-field">
              <InputLabel>Speciality</InputLabel>
              <Select
                value={speciality}
                onChange={(e) => setSpeciality(e.target.value)}
              >
                <MenuItem value="Informatique">Computer science</MenuItem>
                <MenuItem value="Gestion">Management</MenuItem>
                <MenuItem value="Économie">Economy</MenuItem>
                <MenuItem value="Autre">Other</MenuItem>
              </Select>
            </FormControl>
            <div style={{ marginBottom: "10px" }}>
              <label
                htmlFor="upload-file"
                style={{ cursor: "pointer", marginRight: "10px" }}
              >
                <DriveFolderUploadIcon fontSize="large" color="primary" />
              </label>
              <input
                id="upload-file"
                type="file"
                style={{ display: "none" }}
                onChange={handleFileUpload}
              />
              {selectedFile && <span>{selectedFile.name}</span>}
            </div>
            <Button
              variant="contained"
              endIcon={<SendIcon />}
              onClick={handleSubmit}
            >
              Send
            </Button>
          </div>
        )} 
      </div>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm the deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
          Are you sure you want to delete this file? This action is irreversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
           Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </StyledWrapper>
  );
}

export default Documents;
