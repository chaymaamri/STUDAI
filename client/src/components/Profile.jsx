import React, { useState, useEffect } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Divider,
  IconButton,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
  Card,
  CardContent
} from '@mui/material';
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  EmojiEvents as HobbiesIcon,
  VpnKey as PasswordIcon,
  PhotoCamera as CameraIcon
} from '@mui/icons-material';

const ProfileUpdate = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userId = user ? user.id : null;

  const [nomPrenom, setNomPrenom] = useState('');
  const [hobbies, setHobbies] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [confirmationDialog, setConfirmationDialog] = useState({
    open: false,
    action: null,
    message: ''
  });

  useEffect(() => {
    if (!userId) return;
    fetch(`http://localhost:5000/api/user/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setNomPrenom(data.nomPrenom);
        setHobbies(data.hobbies || '');
        if (!storedUser) {
          localStorage.setItem('user', JSON.stringify(data));
        }
      })
      .catch((err) => {
        console.error(err);
        showNotification('Error loading profile', 'error');
      });
  }, [userId, storedUser]);

  if (!userId) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <Card elevation={5} sx={{ p: 4, borderRadius: 4, backgroundColor: '#f8f9fa' }}>
          <Typography variant="h5" color="error">
            Unauthorized Access
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Please log in to access your profile.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 3, borderRadius: 8, px: 4 }}
            href="/login"
          >
            Sign In
          </Button>
        </Card>
      </Container>
    );
  }

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const closeNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleConfirmation = (action, message) => {
    setConfirmationDialog({ open: true, action, message });
  };

  const handleConfirmAction = () => {
    if (confirmationDialog.action) {
      confirmationDialog.action();
    }
    setConfirmationDialog({ open: false, action: null, message: '' });
  };

  const handleCancelAction = () => {
    setConfirmationDialog({ open: false, action: null, message: '' });
  };

  const updateName = () => {
    fetch('http://localhost:5000/api/user/name', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId, nomPrenom })
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        const updatedUser = { ...user, nomPrenom };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        showNotification('Name updated successfully');
        setActiveSection(null);
      })
      .catch((err) => {
        console.error('Error updating name:', err);
        showNotification('Error updating name', 'error');
      });
  };

  const updateHobbies = () => {
    fetch('http://localhost:5000/api/user/hobbies', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId, hobbies })
    })
      .then((res) => res.json())
      .then((data) => {
        const updatedUser = { ...user, hobbies };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        showNotification('Hobbies updated successfully');
        setActiveSection(null);
      })
      .catch((err) => {
        console.error('Error updating hobbies:', err);
        showNotification('Error updating hobbies', 'error');
      });
  };

  const updatePassword = () => {
    if (password !== confirmPassword) {
      showNotification('Passwords do not match', 'error');
      return;
    }
    
    if (password.length < 6) {
      showNotification('Password must be at least 6 characters', 'warning');
      return;
    }
    
    fetch('http://localhost:5000/api/user/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId, password })
    })
      .then((res) => res.json())
      .then((data) => {
        setPassword('');
        setConfirmPassword('');
        showNotification('Password updated successfully');
        setActiveSection(null);
      })
      .catch((err) => {
        console.error(err);
        showNotification('Error updating password', 'error');
      });
  };

  const deleteAccount = () => {
    setOpenDialog(false);
    fetch(`http://localhost:5000/api/user/${userId}`, {
      method: 'DELETE'
    })
      .then((res) => res.json())
      .then((data) => {
        localStorage.removeItem('user');
        showNotification('Account deleted successfully');
        // Redirect to homepage after short delay
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      })
      .catch((err) => {
        console.error(err);
        showNotification('Error deleting account', 'error');
      });
  };

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper 
        elevation={6} 
        sx={{ 
          p: { xs: 2, sm: 4 }, 
          mt: 4, 
          borderRadius: 4, 
          background: 'linear-gradient(to right bottom, #ffffff, #f8f9fa)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}
      >
        {/* Header with avatar */}
        <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', mb: 4 }}>
          <Box sx={{ position: 'relative', mr: isMobile ? 0 : 4, mb: isMobile ? 2 : 0 }}>
            <Avatar 
              src="/path/to/user-avatar.jpg" 
              alt={nomPrenom} 
              sx={{ 
                width: 120, 
                height: 120, 
                border: '4px solid white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              {nomPrenom.charAt(0)}
            </Avatar>
            
          </Box>
          <Box sx={{ textAlign: isMobile ? 'center' : 'left' }}>
            <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
              My Profile
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your personal information and account settings
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Name Section */}
        <Card 
          elevation={2} 
          sx={{ 
            mb: 3, 
            borderRadius: 3,
            transition: 'all 0.3s ease',
            transform: activeSection === 'name' ? 'scale(1.01)' : 'scale(1)',
            '&:hover': { boxShadow: '0 6px 20px rgba(0,0,0,0.12)' }
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon color="primary" sx={{ mr: 2 }} />
                <Typography variant="h6">Personal Information</Typography>
              </Box>
              <Button 
                startIcon={activeSection === 'name' ? <SaveIcon /> : <EditIcon />}
                color={activeSection === 'name' ? 'success' : 'primary'}
                variant={activeSection === 'name' ? 'contained' : 'outlined'}
                onClick={() => toggleSection('name')}
                sx={{ borderRadius: 8 }}
              >
                {activeSection === 'name' ? 'Save' : 'Edit'}
              </Button>
            </Box>
            
            {activeSection === 'name' ? (
              <Box component="form" noValidate autoComplete="off">
                <TextField
                  fullWidth
                  label="Full Name"
                  variant="outlined"
                  value={nomPrenom}
                  onChange={(e) => setNomPrenom(e.target.value)}
                  sx={{ 
                    mt: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleConfirmation(updateName, 'Do you want to confirm updating your name?')}
                    startIcon={<SaveIcon />}
                    sx={{ borderRadius: 8 }}
                  >
                    Update
                  </Button>
                </Box>
              </Box>
            ) : (
              <Typography variant="body1" sx={{ py: 2 }}>
                {nomPrenom || 'Not specified'}
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Hobbies Section */}
        <Card 
          elevation={2} 
          sx={{ 
            mb: 3, 
            borderRadius: 3,
            transition: 'all 0.3s ease',
            transform: activeSection === 'hobbies' ? 'scale(1.01)' : 'scale(1)',
            '&:hover': { boxShadow: '0 6px 20px rgba(0,0,0,0.12)' }
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <HobbiesIcon color="primary" sx={{ mr: 2 }} />
                <Typography variant="h6">Hobbies</Typography>
              </Box>
              <Button 
                startIcon={activeSection === 'hobbies' ? <SaveIcon /> : <EditIcon />}
                color={activeSection === 'hobbies' ? 'success' : 'primary'}
                variant={activeSection === 'hobbies' ? 'contained' : 'outlined'}
                onClick={() => toggleSection('hobbies')}
                sx={{ borderRadius: 8 }}
              >
                {activeSection === 'hobbies' ? 'Save' : 'Edit'}
              </Button>
            </Box>
            
            {activeSection === 'hobbies' ? (
              <Box component="form" noValidate autoComplete="off">
                <TextField
                  fullWidth
                  label="Hobbies"
                  variant="outlined"
                  multiline
                  rows={3}
                  value={hobbies}
                  onChange={(e) => setHobbies(e.target.value)}
                  placeholder="Ex: Reading, Traveling, Sports, Cinema..."
                  sx={{ 
                    mt: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleConfirmation(updateHobbies, 'Do you want to confirm updating your hobbies?')}
                    startIcon={<SaveIcon />}
                    sx={{ borderRadius: 8 }}
                  >
                    Update
                  </Button>
                </Box>
              </Box>
            ) : (
              <Typography variant="body1" sx={{ py: 2 }}>
                {hobbies || 'No hobbies specified'}
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Password Section */}
        <Card 
          elevation={2} 
          sx={{ 
            mb: 3, 
            borderRadius: 3,
            transition: 'all 0.3s ease',
            transform: activeSection === 'password' ? 'scale(1.01)' : 'scale(1)',
            '&:hover': { boxShadow: '0 6px 20px rgba(0,0,0,0.12)' }
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PasswordIcon color="primary" sx={{ mr: 2 }} />
                <Typography variant="h6">Security</Typography>
              </Box>
              <Button 
                startIcon={activeSection === 'password' ? <SaveIcon /> : <EditIcon />}
                color={activeSection === 'password' ? 'success' : 'primary'}
                variant={activeSection === 'password' ? 'contained' : 'outlined'}
                onClick={() => toggleSection('password')}
                sx={{ borderRadius: 8 }}
              >
                {activeSection === 'password' ? 'Save' : 'Edit'}
              </Button>
            </Box>
            
            {activeSection === 'password' ? (
              <Box component="form" noValidate autoComplete="off">
                <TextField
                  fullWidth
                  label="New Password"
                  type="password"
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={{ 
                    mt: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  variant="outlined"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={password !== confirmPassword && confirmPassword !== ''}
                  helperText={password !== confirmPassword && confirmPassword !== '' ? 'Passwords do not match' : ''}
                  sx={{ 
                    mt: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleConfirmation(updatePassword, 'Do you want to confirm updating your password?')}
                    startIcon={<SaveIcon />}
                    disabled={!password || password !== confirmPassword}
                    sx={{ borderRadius: 8 }}
                  >
                    Update
                  </Button>
                </Box>
              </Box>
            ) : (
              <Typography variant="body1" sx={{ py: 2 }}>
                ••••••••
              </Typography>
            )}
          </CardContent>
        </Card>

        <Divider sx={{ my: 4 }} />

        {/* Delete Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button 
            variant="outlined" 
            color="error" 
            onClick={() => setOpenDialog(true)}
            startIcon={<DeleteIcon />}
            sx={{ 
              borderRadius: 8, 
              px: 3,
              borderWidth: 2,
              '&:hover': { 
                borderWidth: 2,
                bgcolor: 'rgba(211, 47, 47, 0.04)'
              }
            }}
          >
            Delete my account
          </Button>
        </Box>
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog 
        open={confirmationDialog.open} 
        onClose={handleCancelAction}
        PaperProps={{
          sx: {
            borderRadius: 4,
            px: 1
          }
        }}
      >
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>
          <Typography>{confirmationDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCancelAction}
            sx={{ borderRadius: 8 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmAction} 
            color="primary" 
            variant="contained"
            sx={{ borderRadius: 8 }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 4,
            px: 1
          }
        }}
      >
        <DialogTitle sx={{ color: 'error.main' }}>
          Delete Confirmation
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete your account? This action is irreversible.
          </Typography>
          <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
            All your personal data will be permanently deleted from our servers.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenDialog(false)}
            sx={{ borderRadius: 8 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={deleteAccount} 
            color="error" 
            variant="contained"
            startIcon={<DeleteIcon />}
            sx={{ borderRadius: 8 }}
          >
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={closeNotification} 
          severity={notification.severity} 
          variant="filled"
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProfileUpdate;
