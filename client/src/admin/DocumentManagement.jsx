import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  useMediaQuery,
  Typography,
  Box,
  Chip,
  Tooltip,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Alert,
  Snackbar,
  Divider,
  Menu,
  MenuItem,
  Badge,
  Container,
  Grid,
  Stack,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
} from "@mui/material";

// Icons
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import SortIcon from "@mui/icons-material/Sort";
import RefreshIcon from "@mui/icons-material/Refresh";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PersonIcon from "@mui/icons-material/Person";
import WarningIcon from "@mui/icons-material/Warning";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { useTheme } from "@mui/material/styles";
import axios from "axios";

const DocumentManagement = () => {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewType, setPreviewType] = useState("");
  const [previewDocName, setPreviewDocName] = useState("");
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [selectedDocName, setSelectedDocName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // Pour le menu de tri et de filtre
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Pour le menu contextuel sur mobile
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState(null);
  const [currentDoc, setCurrentDoc] = useState(null);

  const theme = useTheme();
  const isXSmall = useMediaQuery(theme.breakpoints.down("xs"));
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const isMedium = useMediaQuery(theme.breakpoints.down("md"));
  const isLarge = useMediaQuery(theme.breakpoints.down("lg"));
  const isFullScreenPreview = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    // Filtrage et tri des documents à chaque changement de critères
    let filtered = [...documents];

    // Appliquer le filtre de recherche
    if (searchQuery) {
      filtered = filtered.filter(
        (doc) =>
          doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (doc.description &&
            doc.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) ||
          (doc.nomPrenom &&
            doc.nomPrenom.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Appliquer le filtre de statut
    if (activeFilter !== "all") {
      filtered = filtered.filter((doc) => doc.status === activeFilter);
    }

    // Appliquer le tri
    switch (sortBy) {
      case "newest":
        filtered.sort(
          (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
        );
        break;
      case "oldest":
        filtered.sort(
          (a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0)
        );
        break;
      case "az":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "za":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    setFilteredDocuments(filtered);
  }, [documents, searchQuery, activeFilter, sortBy]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/admin/files");
      console.log("Documents fetched:", response.data); // Log les données reçues
      setDocuments(response.data);
      setNotification({
        open: true,
        message: "Successful documents",
        severity: "success",
      });
    } catch (error) {
      console.error("Error when recovering documents:", error);
      setError("Impossible to load the documents");
      setNotification({
        open: true,
        message: "Error when loading documents",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };
  const handleApproveDoc = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/documents/approve/${selectedDocId}`
      );
      fetchDocuments();
      setNotification({
        open: true,
        message: `Document "${selectedDocName}" successfully approved`,
        severity: "success",
      });
    } catch (error) {
      console.error("Error when the document approval :", error);
      setNotification({
        open: true,
        message: "Error when the document approval",
        severity: "error",
      });
    } finally {
      setConfirmApproveOpen(false);
      setActionMenuAnchorEl(null);
    }
  };

  const handleDeleteDoc = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/api/admin/documents/${selectedDocId}`
      );
      fetchDocuments();
      setNotification({
        open: true,
        message: `Document "${selectedDocName}"successfully removed`,
        severity: "success",
      });
    } catch (error) {
      console.error("Error when deleting the document :", error);
      setNotification({
        open: true,
        message: "Error when deleting the document",
        severity: "error",
      });
    } finally {
      setConfirmDeleteOpen(false);
      setActionMenuAnchorEl(null);
    }
  };

  const handleViewDoc = async (doc) => {
    setLoadingPreview(true);
    setPreviewDocName(doc.name);
    try {
      // Appel à l'API pour récupérer l'URL du fichier
      const response = await axios.get(
        `http://localhost:5000/api/admin/files/${doc.id}/pdf`
      );

      const { fileUrl } = response.data; // Récupérer l'URL du fichier
      setPreviewUrl(fileUrl);

      // Déterminer le type de fichier pour l'aperçu
      if (doc.name.match(/\.(pdf)$/i)) {
        setPreviewType("pdf");
      } else if (doc.name.match(/\.(jpg|jpeg|png|gif)$/i)) {
        setPreviewType("image");
      } else {
        setPreviewType("other");
      }

      setPreviewOpen(true);
      setActionMenuAnchorEl(null);
    } catch (error) {
      console.error("Error when recovering the document for preview:", error);
      setNotification({
        open: true,
        message: "Impossible to load the document overview",
        severity: "error",
      });
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");
    setPreviewType("");
    setPreviewDocName("");
  };

  const openConfirmDelete = (docId, docName) => {
    setSelectedDocId(docId);
    setSelectedDocName(docName);
    setConfirmDeleteOpen(true);
    setActionMenuAnchorEl(null);
  };

  const openConfirmApprove = (docId, docName) => {
    setSelectedDocId(docId);
    setSelectedDocName(docName);
    setConfirmApproveOpen(true);
    setActionMenuAnchorEl(null);
  };

  const closeConfirmDialog = () => {
    setConfirmDeleteOpen(false);
    setConfirmApproveOpen(false);
    setSelectedDocId(null);
    setSelectedDocName("");
  };

  const handleDownload = (doc) => {
    console.log("Document data:", doc); // Log les données du document
    if (!doc.file_path) {
      console.error("File path is undefined for this document:", doc);
      setNotification({
        open: true,
        message: "File path is missing for this document.",
        severity: "error",
      });
      return;
    }

    const link = document.createElement("a");
    link.href = `http://localhost:5000/${doc.file_path}`;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setActionMenuAnchorEl(null);
  };

  // Fonctions pour les menus de filtre et de tri
  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    handleFilterClose();
  };

  const handleSortClick = (event) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    handleSortClose();
  };

  // Gestion du menu d'actions contextuel sur mobile
  const handleActionMenuOpen = (event, doc) => {
    event.stopPropagation();
    setActionMenuAnchorEl(event.currentTarget);
    setCurrentDoc(doc);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchorEl(null);
    setCurrentDoc(null);
  };
  const handlePreview = (doc) => {
    // Création d'un lien pour prévisualiser le fichier
    const previewUrl = `http://localhost:5000/${doc.file_path}`;
    window.open(previewUrl, "_blank");
    setActionMenuAnchorEl(null);
  };
  // Fonction pour obtenir l'icône de statut appropriée
  const getStatusChip = (status) => {
    switch (status) {
      case "pending":
        return (
          <Chip
            icon={!isSmall ? <WarningIcon /> : null}
            label="Pending"
            color="warning"
            size="small"
            variant="outlined"
          />
        );
      case "accepted":
        return (
          <Chip
            icon={!isSmall ? <CheckCircleIcon /> : null}
            label="Approved"
            color="success"
            size="small"
            variant="outlined"
          />
        );
      default:
        return <Chip label={status} size="small" variant="outlined" />;
    }
  };

  // Fonction pour obtenir l'icône de type de document appropriée
  const getDocumentIcon = (docName) => {
    if (docName.match(/\.(pdf)$/i)) {
      return <PictureAsPdfIcon color="error" />;
    } else if (docName.match(/\.(jpg|jpeg|png|gif)$/i)) {
      return <ImageIcon color="primary" />;
    } else {
      return <InsertDriveFileIcon color="action" />;
    }
  };

  // Obtenir le nombre de documents par statut
  const getStatusCounts = () => {
    const counts = {
      all: documents.length,
      pending: documents.filter((doc) => doc.status === "pending").length,
      accepted: documents.filter((doc) => doc.status === "accepted").length,
      rejected: documents.filter((doc) => doc.status === "rejected").length,
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  // Rendu conditionnel de l'affichage du tableau ou de la liste selon la taille de l'écran
  const renderDocumentsView = () => {
    if (loading) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 200,
          }}
        >
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      );
    }

    if (filteredDocuments.length === 0) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: 200,
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No document found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Change your search criteria or refresh the page
          </Typography>
        </Box>
      );
    }

    // Vue mobile : Liste au lieu du tableau
    if (isSmall) {
      return (
        <List sx={{ width: "100%", bgcolor: "background.paper", p: 0 }}>
          {filteredDocuments.map((doc) => (
            <React.Fragment key={doc.id}>
              <ListItem
                alignItems="flex-start"
                sx={{
                  borderLeft:
                    doc.status === "pending" ? "4px solid #ff9800" : "none",
                  py: 2,
                }}
              >
                <ListItemIcon sx={{ minWidth: 42 }}>
                  {getDocumentIcon(doc.name)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body1" component="div" sx={{ pr: 8 }}>
                      {doc.name}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 1,
                          gap: 1,
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 20,
                            height: 20,
                            bgcolor: "primary.main",
                          }}
                        >
                          <PersonIcon fontSize="small" sx={{ fontSize: 14 }} />
                        </Avatar>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          component="span"
                        >
                          {doc.nomPrenom}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        {getStatusChip(doc.status)}
                      </Box>
                      {doc.description && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          {doc.description}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={(e) => handleActionMenuOpen(e, doc)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      );
    }

    // Vue desktop : Tableau
    return (
      <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Document</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Preview</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
              <TableCell sx={{ fontWeight: "bold" }} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDocuments.map((doc) => (
              <TableRow
                key={doc.id}
                sx={{
                  "&:hover": { backgroundColor: "#f5f5f5" },
                  borderLeft:
                    doc.status === "pending" ? "4px solid #ff9800" : "none",
                }}
              >
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {getDocumentIcon(doc.name)}
                    <Box>
                      <Typography variant="body1">{doc.name}</Typography>
                      {doc.description && !isMedium && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          noWrap
                          sx={{ maxWidth: isMedium ? 150 : 300 }}
                        >
                          {doc.description}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  {doc.file_path ? (
                    <Tooltip title="Preview Document">
                      <IconButton
              size="small"
              color="primary"
              onClick={() => doc && handlePreview(doc)}

            >
                     
                      <VisibilityIcon />
            </IconButton>
                    </Tooltip>
                  ) : (
                    <Typography variant="body2" color="error">
                      File path missing
                    </Typography>
                  )}
                </TableCell>
                <TableCell>{getStatusChip(doc.status)}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} justifyContent="center">
                    {doc.status === "pending" && (
                      <Tooltip title="Approve">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => openConfirmApprove(doc.id, doc.name)}
                        >
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => openConfirmDelete(doc.id, doc.name)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ mb: 3, mt: 2 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" } }}
        >
          Document management
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          gutterBottom
          sx={{ display: { xs: "none", sm: "block" } }}
        >
          Consult, approve or delete the documents submitted by users.
        </Typography>
      </Box>

      {/* Barre de recherche et filtres - adaptative pour mobiles */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 1, sm: 2 },
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
        }}
      >
        <TextField
          placeholder="Search for a document..."
          variant="outlined"
          size="small"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1, maxWidth: { sm: 500 } }}
        />

        <Box
          sx={{
            display: "flex",
            gap: 1,
            justifyContent: { xs: "space-between", sm: "flex-end" },
            mt: { xs: 1, sm: 0 },
          }}
        >
          <Button
            variant="outlined"
            startIcon={isSmall ? null : <FilterListIcon />}
            onClick={handleFilterClick}
            size="small"
            color={activeFilter !== "all" ? "primary" : "inherit"}
            sx={{ minWidth: { xs: 0, sm: 64 }, px: { xs: 1, sm: 2 } }}
          >
            {isSmall ? <FilterListIcon /> : "Filtrer"}
          </Button>

          <Button
            variant="outlined"
            startIcon={isSmall ? null : <SortIcon />}
            onClick={handleSortClick}
            size="small"
            sx={{ minWidth: { xs: 0, sm: 64 }, px: { xs: 1, sm: 2 } }}
          >
            {isSmall ? <SortIcon /> : "Trier"}
          </Button>

          <Tooltip title="Update">
            <IconButton onClick={fetchDocuments} color="primary" size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Menu de filtre */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
        PaperProps={{
          sx: { maxWidth: "100%", width: isSmall ? "250px" : "auto" },
        }}
      >
        <MenuItem
          onClick={() => handleFilterChange("all")}
          selected={activeFilter === "all"}
        >
          All documents ({statusCounts.all})
        </MenuItem>
        <MenuItem
          onClick={() => handleFilterChange("pending")}
          selected={activeFilter === "pending"}
        >
          Pending ({statusCounts.pending})
        </MenuItem>
        <MenuItem
          onClick={() => handleFilterChange("accepted")}
          selected={activeFilter === "accepted"}
        >
          Approved ({statusCounts.accepted})
        </MenuItem>
      </Menu>

      {/* Menu de tri */}
      <Menu
        anchorEl={sortAnchorEl}
        open={Boolean(sortAnchorEl)}
        onClose={handleSortClose}
        PaperProps={{
          sx: { maxWidth: "100%", width: isSmall ? "250px" : "auto" },
        }}
      >
        <MenuItem
          onClick={() => handleSortChange("az")}
          selected={sortBy === "az"}
        >
          Name (A to Z)
        </MenuItem>
        <MenuItem
          onClick={() => handleSortChange("za")}
          selected={sortBy === "za"}
        >
          Name (A to Z)
        </MenuItem>
      </Menu>

      {/* Menu d'actions pour mobiles */}
      <Menu
        anchorEl={actionMenuAnchorEl}
        open={Boolean(actionMenuAnchorEl)}
        onClose={handleActionMenuClose}
        PaperProps={{ sx: { maxWidth: "100%", width: "200px" } }}
      >
        {/* <MenuItem onClick={() => currentDoc && handleViewDoc(currentDoc)}>
    <ListItemIcon>
      <VisibilityIcon fontSize="small" />
    </ListItemIcon>
    <ListItemText>Voir le document</ListItemText>
  </MenuItem> */}
        {/* <MenuItem onClick={() => currentDoc && handleDownload(currentDoc)}>
    <ListItemIcon>
      <FileDownloadIcon fontSize="small" />
    </ListItemIcon>
    <ListItemText>Télécharger</ListItemText>
  </MenuItem> */}
        <MenuItem onClick={() => currentDoc && handlePreview(currentDoc)}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Preview</ListItemText>
        </MenuItem>
        {currentDoc && currentDoc.status === "pending" && (
          <MenuItem
            onClick={() =>
              currentDoc && openConfirmApprove(currentDoc.id, currentDoc.name)
            }
          >
            <ListItemIcon>
              <CheckCircleIcon fontSize="small" color="success" />
            </ListItemIcon>
            <ListItemText>Approve</ListItemText>
          </MenuItem>
        )}
        <MenuItem
          onClick={() =>
            currentDoc && openConfirmDelete(currentDoc.id, currentDoc.name)
          }
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Tableau de documents - adapté selon la taille d'écran */}
      <Card elevation={2} sx={{ borderRadius: 1 }}>
        <CardContent sx={{ p: 0 }}>{renderDocumentsView()}</CardContent>
      </Card>

      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: isSmall ? "center" : "right",
        }}
        sx={{ bottom: { xs: 16, sm: 24 } }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      {/* Dialogue d'aperçu du document - plein écran sur mobile */}
      <Dialog
        open={previewOpen}
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
        fullScreen={isFullScreenPreview}
        PaperProps={{
          sx: {
            borderRadius: isFullScreenPreview ? 0 : 2,
            height: isFullScreenPreview ? "100%" : "80vh",
            maxHeight: isFullScreenPreview ? "100%" : "90vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: { xs: 1, sm: 2 },
            px: { xs: 2, sm: 3 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              overflow: "hidden",
            }}
          >
            {previewDocName && getDocumentIcon(previewDocName)}
            <Typography
              variant="h6"
              noWrap
              sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
            >
              {previewDocName}
            </Typography>
          </Box>
          <IconButton
            aria-label="close"
            onClick={handleClosePreview}
            size={isSmall ? "medium" : "small"}
            sx={{ ml: 1 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent
          dividers
          sx={{ textAlign: "center", p: 0, height: "100%" }}
        >
          {loadingPreview ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <CircularProgress />
            </Box>
          ) : previewType === "pdf" ? (
            <object
              data={previewUrl}
              type="application/pdf"
              width="100%"
              height="100%"
              style={{ border: "none" }}
            >
              <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="body1" paragraph>
                  Your browser does not support the display of PDFs.
                </Typography>
                <Button
                  variant="contained"
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<FileDownloadIcon />}
                >
                  Download the PDF
                </Button>
              </Box>
            </object>
          ) : previewType === "image" ? (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#f5f5f5",
                overflowY: "auto",
                p: 2,
              }}
            >
              <img
                src={previewUrl}
                alt="Document preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: isFullScreenPreview ? "none" : "100%",
                  objectFit: "contain",
                }}
              />
            </Box>
          ) : (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="body1" paragraph>
                The preview is not available for this type of file.
              </Typography>
              <Button
                variant="contained"
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<FileDownloadIcon />}
              >
                Download the file
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{ p: { xs: 1.5, sm: 2 }, justifyContent: "space-between" }}
        >
          <Button onClick={handleClosePreview} variant="outlined">
            Close
          </Button>
          <Button
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="contained"
            startIcon={<FileDownloadIcon />}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={closeConfirmDialog}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: { xs: 1, sm: 2 } } }}
      >
        <DialogTitle sx={{ bgcolor: "#ffebee", py: { xs: 1.5, sm: 2 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <DeleteIcon color="error" />
            <Typography
              variant="h6"
              sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
            >
              Confirm the deletion
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2, pb: 1, px: { xs: 2, sm: 3 }, mt: 1 }}>
          <Typography
            variant="body1"
            sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
          >
            Are you sure you want to definitively delete the document "
            {selectedDocName}" ?
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1, fontSize: { xs: "0.8125rem", sm: "0.875rem" } }}
          >
            This action is irreversible and will permanently delete the system
            of the system.
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{ p: { xs: 1.5, sm: 2 }, justifyContent: "space-between" }}
        >
          <Button
            onClick={closeConfirmDialog}
            variant="outlined"
            size={isSmall ? "small" : "medium"}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteDoc}
            variant="contained"
            color="error"
            size={isSmall ? "small" : "medium"}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de confirmation d'approbation */}
      <Dialog
        open={confirmApproveOpen}
        onClose={closeConfirmDialog}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: { xs: 1, sm: 2 } } }}
      >
        <DialogTitle sx={{ bgcolor: "#e8f5e9", py: { xs: 1.5, sm: 2 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CheckCircleIcon color="success" />
            <Typography
              variant="h6"
              sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
            >
              Confirm approval
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2, pb: 1, px: { xs: 2, sm: 3 }, mt: 1 }}>
          <Typography
            variant="body1"
            sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
          >
            Are you sure you want to approve the document "{selectedDocName}" ?
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1, fontSize: { xs: "0.8125rem", sm: "0.875rem" } }}
          >
            Once approved, the document will be visible for all users of the
            platform.
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{ p: { xs: 1.5, sm: 2 }, justifyContent: "space-between" }}
        >
          <Button
            onClick={closeConfirmDialog}
            variant="outlined"
            size={isSmall ? "small" : "medium"}
          >
            Cancel
          </Button>
          <Button
            onClick={handleApproveDoc}
            variant="contained"
            color="success"
            size={isSmall ? "small" : "medium"}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DocumentManagement;
