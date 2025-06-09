import React, { useEffect, useState, useContext } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";


const pages = [
  "Schedule",
  "To-do List",
  "Academic Chat",
  "PDF",
  "Document Sharing",
];
const settings = [
  { name: "Profile", icon: <AccountCircleIcon />, route: "/profile" },
  { name: "Dashboard", icon: <DashboardIcon />, route: "/dashboard" },
  { name: "Logout", icon: <LogoutIcon />, route: null },
];

function Bar() {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
 

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleMenuItemClick = (setting) => {
    handleCloseUserMenu();
    if (setting.name === "Logout") {
      handleLogout();
    } else if (setting.route) {
      navigate(setting.route);
    }
  };

  const handlePageClick = (page) => {
    if (page === "To-do List") {
      navigate("/todo");
    } else if (page === "Document Sharing") {
      navigate("/documents");
    } else if (page === "Academic Chat") {
      navigate("/ChatAcad");
    } else if (page === "Schedule") {
      navigate("/emplois");
    } else if (page === "PDF") {
      navigate("/courses");
    }
    handleCloseNavMenu();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsLoggedIn(false);
    navigate("/signin");
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (userData && userData.nomPrenom) {
        setUser(userData);
        setIsLoggedIn(true);
      }
    }
  }, []);

  // Fonction pour obtenir les initiales du nom
  const getInitials = (name) => {
    if (!name) return "G";
    const names = name.split(" ");
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[1].charAt(0)}`;
    }
    return name.charAt(0);
  };

  // Fonction pour générer une couleur aléatoire mais cohérente basée sur le nom d'utilisateur
  const stringToColor = (string) => {
    if (!string) return "#1976d2";
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = "#";
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    return color;
  };

  return (
    <header>
      <AppBar
        position="fixed"
        className="custom-navbar"
        sx={{ width: "100%", top: 0, left: 0, margin: 0, padding: 0, borderRadius: 0, height: "65px" }}
      >
        <Container maxWidth="xl" sx={{ padding: 0 }}>
          <Toolbar disableGutters className="custom-toolbar">
            <Box
              sx={{
                flexGrow: 1,
                display: { xs: "flex", md: "none" },
                justifyContent: "flex-start",
              }}
            >
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
                className="custom-menu-button"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: "block", md: "none" },
                }}
              >
                {pages.map((page) => (
                  <MenuItem key={page} onClick={() => handlePageClick(page)}>
                    <Typography textAlign="center">{page}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
            <Button onClick={() => navigate("./")} sx={{ padding: 0 }}>
              <Box
                component="img"
                sx={{
                  height: 65,
                  width: 60,
                  maxHeight: { xs: 233, md: 167 },
                  maxWidth: { xs: 350, md: 250 },
                }}
                alt="aitudiant"
                src={`${process.env.PUBLIC_URL}/aitudiant.png`}
              />
            </Button>
            <Typography
              variant="h5"
              noWrap
              component="a"
              href="#app-bar-with-responsive-menu"
              sx={{
                mr: 2,
                display: { xs: "flex", md: "none" },
                flexGrow: 1,
                fontFamily: "Arial",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            ></Typography>

            <Box
              sx={{
                flexGrow: 1,
                display: { xs: "none", md: "flex" },
                justifyContent: "center",
              }}
            >
              {pages.map((page) => (
                <Button
                  key={page}
                  onClick={() => handlePageClick(page)}
                  sx={{ my: 2, color: "white", display: "block" }}
                >
                  {page}
                </Button>
              ))}
            </Box>

            <Box sx={{ flexGrow: 0 }}>
              {isLoggedIn ? (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      mr: 2, 
                      display: { xs: "none", md: "block" }, 
                      fontWeight: 500 
                    }}
                  >
                    {user ? user.nomPrenom : ""}
                  </Typography>
                  <Tooltip title="Account Settings">
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                      <Avatar 
                        alt={user ? user.nomPrenom : "Guest"}
                        sx={{ 
                          width: 40, 
                          height: 40,
                          bgcolor: user ? stringToColor(user.nomPrenom) : "#1976d2",
                          fontWeight: 600,
                          boxShadow: "0px 3px 5px rgba(0,0,0,0.2)",
                          transition: "transform 0.2s",
                          "&:hover": {
                            transform: "scale(1.1)",
                          }
                        }}
                      >
                        {user ? getInitials(user.nomPrenom) : "G"}
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                </Box>
              ) : (
                <Button 
                  color="inherit" 
                  onClick={() => navigate("/signin")}
                  variant="outlined"
                  sx={{
                    borderColor: "rgba(255, 255, 255, 0.5)",
                    "&:hover": {
                      borderColor: "white",
                      backgroundColor: "rgba(255, 255, 255, 0.1)"
                    }
                  }}
                >
                  Sign in
                </Button>
              )}
              <Menu
                sx={{ 
                  mt: "45px",
                  "& .MuiPaper-root": {
                    borderRadius: 2,
                    minWidth: 200,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  }
                }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {user && (
                  <Box sx={{ px: 2, py: 1.5, backgroundColor: "primary.light", color: "white" }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {user.nomPrenom}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.7 }}>
                      {user.email || "Student"}
                    </Typography>
                  </Box>
                )}
                
                <Divider />
                
                {settings.map((setting) => (
                  <MenuItem 
                    key={setting.name} 
                    onClick={() => handleMenuItemClick(setting)}
                    sx={{ 
                      py: 1.5,
                      "&:hover": {
                        backgroundColor: setting.name === "Logout" 
                          ? "rgba(211, 47, 47, 0.04)" 
                          : "rgba(25, 118, 210, 0.04)"
                      }
                    }}
                  >
                    <ListItemIcon sx={{ 
                      color: setting.name === "Logout" ? "error.main" : "primary.main",
                      minWidth: 36
                    }}>
                      {setting.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={setting.name} 
                      sx={{ 
                        color: setting.name === "Logout" ? "error.main" : "inherit"
                      }} 
                    />
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </header>
  );
}

export default Bar;