import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button, 
  Typography, 
  Box, 
  Chip, 
  IconButton, 
  Tooltip, 
  Alert, 
  Skeleton, 
  useMediaQuery,
  Grid,
  Card,
  CardContent,
  Divider,
  Stack
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import { 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle 
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import EmailIcon from '@mui/icons-material/Email';
import SchoolIcon from '@mui/icons-material/School';
import { TextField, InputAdornment, Menu, MenuItem, FormControl, Select } from '@mui/material';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openActionDialog, setOpenActionDialog] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  
  const theme = useTheme();
  const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down('xs'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, statusFilter]);

  useEffect(() => {
    // Auto-switch to card view on small screens
    if (isSmallScreen) {
      setViewMode('card');
    } else {
      setViewMode('table');
    }
  }, [isSmallScreen]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:5000/api/admin/users');
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs :", error);
      setError("Unable to load users. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];
    
    // Appliquer la recherche
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.nomPrenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.etablissement && user.etablissement.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Appliquer le filtre de statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }
    
    setFilteredUsers(filtered);
  };

  const handleApprove = async (userId) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/users/approve/${userId}`);
      fetchUsers();
    } catch (error) {
      console.error("Erreur lors de l'approbation de l'utilisateur :", error);
      setError("Error when user approval. Please try again.");
    }
  };

  const handleReject = async (userId) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/users/reject/${userId}`);
      fetchUsers();
    } catch (error) {
      console.error("Erreur lors du rejet de l'utilisateur :", error);
      setError("Error when rejection of the user. Please try again.");
    }
  };

  const handleDelete = async (userId) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`);
      fetchUsers();
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur :", error);
      setError("Error when deleting the user. Please try again.");
    }
  };

  const handleOpenDialog = (userId) => {
    setSelectedUserId(userId);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedUserId(null);
    setOpenDialog(false);
  };

  const handleOpenActionDialog = (userId, action) => {
    setSelectedUserId(userId);
    setSelectedAction(action);
    setOpenActionDialog(true);
  };

  const handleCloseActionDialog = () => {
    setSelectedUserId(null);
    setSelectedAction(null);
    setOpenActionDialog(false);
  };

  const handleFilterMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterMenuClose = () => {
    setAnchorEl(null);
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'table' ? 'card' : 'table');
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'approved':
        return <Chip 
                 label="Approved" 
                 color="success" 
                 size="small" 
                 icon={<CheckCircleIcon />} 
               />;
      case 'rejected':
        return <Chip 
                 label="Rejected" 
                 color="error" 
                 size="small" 
                 icon={<CancelIcon />} 
               />;
      case 'pending':
        return <Chip 
                 label="Pending" 
                 color="warning" 
                 size="small" 
               />;
      default:
        return <Chip 
                 label={status} 
                 color="default" 
                 size="small" 
               />;
    }
  };

  const renderUserActions = (user) => (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: isSmallScreen ? 'center' : 'flex-start' }}>
      {user.status !== "rejected" && (
        <>
          {user.status === "pending" && (
            <Tooltip title="Approve">
              <IconButton 
                onClick={() => handleOpenActionDialog(user.id, "approve")}
                color="primary"
                size="small"
              >
                <CheckCircleIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Reject">
            <IconButton 
              onClick={() => handleOpenActionDialog(user.id, "reject")}
              color="error"
              size="small"
            >
              <CancelIcon />
            </IconButton>
          </Tooltip>
        </>
      )}
      <Tooltip title="Delete">
        <IconButton 
          onClick={() => handleOpenDialog(user.id)}
          color="error"
          size="small"
        >
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );

  // Rendu des cartes pour mobile
  const renderUserCards = () => {
    if (loading) {
      return (
        <Grid container spacing={2}>
          {[...Array(4)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ height: '100%', boxShadow: 2, borderRadius: 2 }}>
                <CardContent>
                  <Skeleton height={30} width="60%" />
                  <Skeleton height={24} width="80%" />
                  <Box sx={{ mt: 2 }}>
                    <Skeleton height={24} width="40%" />
                  </Box>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                    <Skeleton height={36} width={120} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      );
    }

    if (filteredUsers.length === 0) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
          No user found.
          </Typography>
        </Box>
      );
    }

    return (
      <Grid container spacing={2}>
        {filteredUsers.map((user) => (
          <Grid item xs={12} sm={6} md={4} key={user.id}>
            <Card 
              sx={{ 
                height: '100%', 
                boxShadow: 2, 
                borderRadius: 2,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                    {user.nomPrenom}
                  </Typography>
                  {getStatusChip(user.status)}
                </Box>
                
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                  
                  {user.etablissement && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SchoolIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {user.etablissement}
                      </Typography>
                    </Box>
                  )}
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">
                      Points: <strong>{user.points}</strong>
                    </Typography>
                    {/* <Typography variant="body2">
                      Niveau: <strong>{user.niveau}</strong>
                    </Typography> */}
                  </Box>
                </Stack>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  {renderUserActions(user)}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  // Rendu du tableau pour desktop
  const renderUserTable = () => (
    <TableContainer>
      {loading ? (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              {!isSmallScreen && <TableCell>Email</TableCell>}
              <TableCell>Status</TableCell>
              {!isMediumScreen && <TableCell>Institution</TableCell>}
              {!isMediumScreen && <TableCell>Hobbies</TableCell>}
              {!isSmallScreen && <TableCell>Points</TableCell>}
              {/* {!isSmallScreen && <TableCell>Niveau</TableCell>} */}
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(5)].map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton /></TableCell>
                <TableCell><Skeleton /></TableCell>
                {!isSmallScreen && <TableCell><Skeleton /></TableCell>}
                <TableCell><Skeleton /></TableCell>
                {!isMediumScreen && <TableCell><Skeleton /></TableCell>}
                {!isMediumScreen && <TableCell><Skeleton /></TableCell>}
                {!isSmallScreen && <TableCell><Skeleton /></TableCell>}
                {!isSmallScreen && <TableCell><Skeleton /></TableCell>}
                <TableCell><Skeleton /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : filteredUsers.length > 0 ? (
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.action.hover }}>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              {!isSmallScreen && <TableCell>Email</TableCell>}
              <TableCell>Status</TableCell>
              {!isMediumScreen && <TableCell>Institution</TableCell>}
              {!isMediumScreen && <TableCell>Hobbies</TableCell>}
              {!isSmallScreen && <TableCell>Points</TableCell>}
              {/* {!isSmallScreen && <TableCell>Niveau</TableCell>} */}
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow 
                key={user.id}
                sx={{ 
                  '&:hover': { backgroundColor: theme.palette.action.hover },
                  transition: 'background-color 0.2s'
                }}
              >
                <TableCell>{user.id}</TableCell>
                <TableCell sx={{ fontWeight: 'medium' }}>{user.nomPrenom}</TableCell>
                {!isSmallScreen && <TableCell>{user.email}</TableCell>}
                <TableCell>{getStatusChip(user.status)}</TableCell>
                {!isMediumScreen && <TableCell>{user.etablissement || '-'}</TableCell>}
                {!isMediumScreen && <TableCell>{user.hobbies || '-'}</TableCell>}
                {!isSmallScreen && <TableCell>{user.points}</TableCell>}
                {/* {!isSmallScreen && <TableCell>{user.niveau}</TableCell>} */}
                <TableCell>{renderUserActions(user)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
          No user found.
          </Typography>
        </Box>
      )}
    </TableContainer>
  );

  return (
    <Box sx={{ width: '100%', p: { xs: 1, sm: 2 } }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', sm: 'center' }, 
        mb: 3, 
        gap: 2 
      }}>
        <Typography 
          variant={isSmallScreen ? "h6" : "h5"} 
          component="h1" 
          sx={{ 
            fontWeight: 'bold', 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: { xs: 'center', sm: 'flex-start' } 
          }}
        >
          <PersonIcon sx={{ mr: 1 }} />
          User management
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2, 
          width: { xs: '100%', sm: 'auto' } 
        }}>
          <TextField
            placeholder="Rechercher..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth={isSmallScreen}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <Box sx={{ 
            display: 'flex', 
            gap: 1, 
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { xs: 'space-between', sm: 'flex-start' }
          }}>
            <FormControl size="small" sx={{ minWidth: { xs: 0, sm: 120 }, flexGrow: { xs: 1, sm: 0 } }}>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                displayEmpty
                startAdornment={<FilterListIcon sx={{ mr: 1 }} />}
                fullWidth
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
            
            <Tooltip title="Update">
              <IconButton onClick={fetchUsers} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={viewMode === 'table' ? "Vue cartes" : "Vue tableau"}>
              <IconButton onClick={toggleViewMode} color="primary">
                {viewMode === 'table' ? 
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 5V19H21V5H3ZM7 7H5V9H7V7ZM5 11V13H7V11H5ZM5 15V17H7V15H5ZM19 17H9V15H19V17ZM19 13H9V11H19V13ZM19 9H9V7H19V9Z" fill="currentColor"/>
                  </svg> : 
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 4H21V6H3V4ZM3 11H21V13H3V11ZM3 18H21V20H3V18Z" fill="currentColor"/>
                  </svg>
                }
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper elevation={3} sx={{ overflow: 'hidden', borderRadius: 2 }}>
        {viewMode === 'table' ? renderUserTable() : (
          <Box sx={{ p: 2 }}>
            {renderUserCards()}
          </Box>
        )}
        
        {filteredUsers.length > 0 && !loading && (
          <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="body2" color="text.secondary" align={isSmallScreen ? "center" : "left"}>
              {filteredUsers.length} user{filteredUsers.length > 1 ? 's' : ''} found{filteredUsers.length > 1 ? 's' : ''}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Dialogue de confirmation de suppression */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          elevation: 5,
          sx: { borderRadius: 2, width: { xs: '90%', sm: 'auto' } }
        }}
        fullWidth={isSmallScreen}
        maxWidth="xs"
      >
        <DialogTitle id="alert-dialog-title" sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'error.main' }}>
            <DeleteIcon sx={{ mr: 1 }} />
            Confirm the deletion
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
          Are you sure you want to delete this user? This action is irreversible?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0, flexDirection: isExtraSmallScreen ? 'column' : 'row', gap: isExtraSmallScreen ? 1 : 0 }}>
          <Button 
            onClick={handleCloseDialog} 
            variant="outlined"
            fullWidth={isExtraSmallScreen}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleDelete(selectedUserId);
              handleCloseDialog();
            }}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            autoFocus
            fullWidth={isExtraSmallScreen}
          >
           Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de confirmation pour approuver/rejeter */}
      <Dialog
        open={openActionDialog}
        onClose={handleCloseActionDialog}
        aria-labelledby="action-dialog-title"
        aria-describedby="action-dialog-description"
        PaperProps={{
          elevation: 5,
          sx: { borderRadius: 2, width: { xs: '90%', sm: 'auto' } }
        }}
        fullWidth={isSmallScreen}
        maxWidth="xs"
      >
        <DialogTitle id="action-dialog-title" sx={{ pb: 1 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            color: selectedAction === "approve" ? 'success.main' : 'error.main' 
          }}>
            {selectedAction === "approve" ? <CheckCircleIcon sx={{ mr: 1 }} /> : <CancelIcon sx={{ mr: 1 }} />}
            {selectedAction === "approve" ? "Confirm the approval": "Confirm the rejection"}
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="action-dialog-description">
            {selectedAction === "approve"
              ? "Are you sure you want to approve this user ?"
              : "Are you sure you want to reject this use ?"}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0, flexDirection: isExtraSmallScreen ? 'column' : 'row', gap: isExtraSmallScreen ? 1 : 0 }}>
          <Button 
            onClick={handleCloseActionDialog} 
            variant="outlined"
            fullWidth={isExtraSmallScreen}
          >
          Close
          </Button>
          <Button
            onClick={() => {
              if (selectedAction === "approve") {
                handleApprove(selectedUserId);
              } else if (selectedAction === "reject") {
                handleReject(selectedUserId);
              }
              handleCloseActionDialog();
            }}
            variant="contained"
            color={selectedAction === "approve" ? "success" : "error"}
            startIcon={selectedAction === "approve" ? <CheckCircleIcon /> : <CancelIcon />}
            autoFocus
            fullWidth={isExtraSmallScreen}
          >
            {selectedAction === "approve" ? "Approuver" : "Rejeter"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;