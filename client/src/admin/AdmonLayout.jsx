import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  IconButton,
  Typography,
  Divider,
  Avatar,
  Tooltip,
  Badge,
  useMediaQuery,
  alpha
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import { useTheme } from '@mui/material/styles';

// Pages admin
import Dashboard from './DashboardAd';
import UserManagement from './UserManagmenet';
import DocumentManagement from './DocumentManagement';

const drawerWidth = 260;

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState({ name: 'Admin', role: 'Administrateur' });

  // Palette de couleurs moderne
  const colorPalette = {
    primary: "#6366F1", // Indigo
    secondary: "#8B5CF6", // Violet
    success: "#10B981", // Emerald
    warning: "#F59E0B", // Amber
    error: "#EF4444", // Rouge
    info: "#3B82F6", // Bleu
    background: "#F3F4F6", // Gris clair
    cardBg: "#FFFFFF", // Blanc
    text: "#374151", // Gris foncé
    textLight: "#9CA3AF", // Gris moyen
    drawer: "#FFFFFF", // Fond du drawer
  };

  useEffect(() => {
    // Récupérer les infos utilisateur du localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Error during user data parsing", e);
      }
    }
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/signin');
  };

  // Vérifier si le chemin actuel correspond à l'élément du menu
  const isActive = (path) => {
    return location.pathname === path;
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
    { text: 'Users', icon: <PeopleIcon />, path: '/admin/users' },
    { text: 'Documents', icon: <DescriptionIcon />, path: '/admin/documents' },
  ];

  const drawerContent = (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'space-between',
      bgcolor: colorPalette.drawer
    }}>
      <Box>
        <Box sx={{ 
          p: 3, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexDirection: 'column',
          textAlign: 'center'
        }}>
          <Box
            component="img"
            src="/api/placeholder/160/50"
            alt="Logo"
            sx={{ mb: 2, width: '70%', height: 'auto' }}
          />
          {/* <Typography variant="h6" sx={{ fontWeight: 'bold', color: colorPalette.primary, mb: 1 }}>
            Panneau d'Administration
          </Typography> */}
        </Box>
        
        <Divider sx={{ mx: 2, bgcolor: alpha(colorPalette.text, 0.1) }} />
        
        <Box sx={{ mt: 2 }}>
          <List sx={{ px: 2 }}>
            {menuItems.map((item) => (
              <ListItem 
                button 
                component={Link} 
                to={item.path}
                key={item.text}
                sx={{
                  mb: 1,
                  borderRadius: 2,
                  bgcolor: isActive(item.path) ? alpha(colorPalette.primary, 0.1) : 'transparent',
                  color: isActive(item.path) ? colorPalette.primary : colorPalette.text,
                  '&:hover': {
                    bgcolor: isActive(item.path) 
                      ? alpha(colorPalette.primary, 0.15) 
                      : alpha(colorPalette.text, 0.05),
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <ListItemIcon sx={{ 
                  color: isActive(item.path) ? colorPalette.primary : colorPalette.textLight,
                  minWidth: '40px'
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontWeight: isActive(item.path) ? 'bold' : 'normal' 
                  }}
                />
                {isActive(item.path) && (
                  <Box
                    sx={{
                      width: 4,
                      height: 30,
                      bgcolor: colorPalette.primary,
                      borderRadius: 4,
                      ml: 1
                    }}
                  />
                )}
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>
      
      <Box sx={{ p: 2, mt: 2 }}>
        <Divider sx={{ mb: 2, mx: 2, bgcolor: alpha(colorPalette.text, 0.1) }} />
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mx: 2, 
          mb: 2,
          p: 1.5,
          borderRadius: 2,
          bgcolor: alpha(colorPalette.primary, 0.05)
        }}>
          <Avatar 
            sx={{ 
              bgcolor: colorPalette.primary,
              width: 40,
              height: 40
            }}
          >
            {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </Avatar>
          <Box sx={{ ml: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: colorPalette.text }}>
              {user.name || 'Admin'}
            </Typography>
            <Typography variant="caption" sx={{ color: colorPalette.textLight }}>
              {user.role || 'Administrateur'}
            </Typography>
          </Box>
        </Box>
        
        <Button
          variant="contained"
          color="error"
          startIcon={<LogoutIcon />}
          fullWidth
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            py: 1,
            textTransform: 'none',
            boxShadow: 2,
            bgcolor: colorPalette.error,
            '&:hover': {
              bgcolor: alpha(colorPalette.error, 0.9),
            }
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: colorPalette.background }}>
      {/* Drawer */}
      {isSmallScreen ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRadius: '0 16px 16px 0',
              boxShadow: '4px 0 10px rgba(0,0,0,0.05)',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRadius: '0 16px 16px 0',
              boxShadow: '4px 0 10px rgba(0,0,0,0.05)',
              border: 'none',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Contenu principal */}
      <Box component="main" sx={{ flexGrow: 1, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
        {/* Topbar */}
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            zIndex: theme.zIndex.drawer + 1,
            bgcolor: colorPalette.cardBg,
            color: colorPalette.text,
            boxShadow: '0px 1px 10px rgba(0, 0, 0, 0.05)',
            borderBottom: `1px solid ${alpha(colorPalette.text, 0.1)}`,
          }}
        >
          <Toolbar>
            {isSmallScreen && (
              <IconButton
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, color: colorPalette.text }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontWeight: 'medium' }}>
              {menuItems.find(item => isActive(item.path))?.text || 'Administration panel'}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {/* <Tooltip title="Notifications">
                <IconButton sx={{ mx: 1, color: colorPalette.textLight }}>
                  <Badge badgeContent={3} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
               */}
              {/* <Tooltip title="Paramètres">
                <IconButton sx={{ mx: 1, color: colorPalette.textLight }}>
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
               */}
              <Box
                sx={{ 
                  display: { xs: 'none', md: 'flex' },
                  alignItems: 'center',
                  ml: 2,
                  p: 1,
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: alpha(colorPalette.text, 0.05),
                  }
                }}
              >
                <Avatar 
                  sx={{ 
                    width: 36, 
                    height: 36,
                    bgcolor: colorPalette.primary,
                    color: '#fff'
                  }}
                >
                  <AccountCircleIcon />
                </Avatar>
                <Box sx={{ ml: 1, display: { xs: 'none', lg: 'block' } }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {user.name || 'Admin'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: colorPalette.textLight }}>
                    {user.role || 'Admin'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Espacement pour éviter que le contenu soit caché sous l'AppBar */}
        <Toolbar />

        {/* Contenu principal avec padding */}
        <Box sx={{ p: 3 }}>
          {/* Sous-routes admin */}
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="documents" element={<DocumentManagement />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
}