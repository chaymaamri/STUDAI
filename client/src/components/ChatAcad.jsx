import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  TextField,
  List,
  ListItem,
  Button,
  ListItemText,
  Paper,
  Divider,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  useMediaQuery,
} from "@mui/material";
import { Add, MoreVert, Menu as MenuIcon, Save } from "@mui/icons-material";
import { get as getEmoji } from "node-emoji";
import ButtonSend from "./ButtonSend";

const ChatAcad = () => {
  const [input, setInput] = useState("");
  const [menuDiscussionId, setMenuDiscussionId] = useState(null);

  const [currentDiscussion, setCurrentDiscussion] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [messages, setMessages] = useState([]);

  const [anchorEl, setAnchorEl] = useState(null);
  const [openRenameDialog, setOpenRenameDialog] = useState(false);
  const [newDiscussionName, setNewDiscussionName] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [saveDiscussionName, setSaveDiscussionName] = useState("");
  const isMobile = useMediaQuery("(max-width:600px)");
  const chatContainerRef = useRef(null);
  let typingTimeout;

  useEffect(() => {
    const userId = getUserId();
    if (!userId) return;

    fetch(`/api/conversations/${userId}`)
      .then((res) => res.json()) // :contentReference[oaicite:0]{index=0}
      .then((data) => {
        setDiscussions(data);
        if (data.length) setCurrentDiscussion(data[0].id);
      })
      .catch(console.error);
  }, []);

  const getUserId = () => {
    const user = localStorage.getItem("user"); // Lire la clé 'user' au lieu de 'userId'
    if (!user) {
      console.log("getUserId: null");
      return null; // Si aucune valeur n'est trouvée, retourne null
    }

    try {
      const parsedUser = JSON.parse(user); // Parse la chaîne JSON
      console.log("getUserId:", parsedUser.id); // Affiche l'ID utilisateur
      return parsedUser.id; // Retourne l'ID utilisateur
    } catch (error) {
      console.error("Erreur lors du parsing de user:", error);
      return null; // En cas d'erreur, retourne null
    }
  };
  useEffect(() => {
    if (!currentDiscussion) return;

    fetch(`/api/messages/${currentDiscussion}`)
      .then((res) => res.json()) // :contentReference[oaicite:1]{index=1}
      .then((data) => setMessages(data))
      .catch(console.error);
  }, [currentDiscussion]);

  // const handleSend = async () => {
  //   if (!input.trim() || !currentDiscussion) return;

  //   // 1) Sauvegarde du message user
  //   await fetch('/api/messages', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({
  //       conversationId: currentDiscussion,
  //       sender: 'user',
  //       text: input
  //     })
  //   });

  //   // 2) Appel au chat et récupération de la réponse IA
  //   const resp = await fetch('/api/chat', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({
  //       conversationId: currentDiscussion,
  //       message: input
  //     })
  //   });
  //   const { message } = await resp.json();     // <— on récupère bien "message"
  //   const aiMessage = message;

  //   // 3) Récupérer l’historique complet
  //   const msgs = await fetch(`/api/messages/${currentDiscussion}`)
  //                       .then(r => r.json());
  //   setMessages(msgs);

  //   // 4) Vider l’input
  //   setInput('');
  // };

  // const handleSend = async () => {
  //   if (input.trim()) {
  //     const newMessage = { text: input, sender: 'user', discussionId: currentDiscussion };
  //     setMessages((prevMessages) => [...prevMessages, newMessage]);
  //     setInput('');
  //     setIsTyping(false);

  //     await saveMessage(newMessage);

  //     try {
  //       const response = await fetch('/api/chat', {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify({ message: input })
  //       });
  //       const data = await response.json();
  //       if (data.message) {
  //         const aiMessage = { text: addEmojis(data.message), sender: 'ai', discussionId: currentDiscussion };
  //         setMessages((prevMessages) => [...prevMessages, aiMessage]);
  //         await saveMessage(aiMessage);
  //       } else {
  //         console.error('Unexpected response structure:', data);
  //       }
  //     } catch (error) {
  //       console.error('Error fetching OpenAI response:', error);
  //     }
  //   }
  // };

  const handleAddDiscussion = async () => {
    console.log("handleAddDiscussion called");
    const userId = getUserId();
    if (!userId) {
      console.error("User ID not found");
      return;
    }

    const newDiscussionName = "New discussion";
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, name: newDiscussionName }),
      });

      if (!response.ok) {
        throw new Error("Failed to create discussion");
      }

      const newDiscussion = await response.json();
      console.log("New discussion created:", newDiscussion);
      setDiscussions((prevDiscussions) => [...prevDiscussions, newDiscussion]);
      setCurrentDiscussion(newDiscussion.id);
    } catch (error) {
      console.error("Erreur lors de la création de la discussion:", error);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // Si aucune discussion n'est sélectionnée, créer une nouvelle discussion
    if (!currentDiscussion) {
      await handleAddDiscussion();
    }

    // Envoyer le message après avoir vérifié ou créé une discussion
    const newMessage = {
      text: input,
      sender: "user",
      discussionId: currentDiscussion,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInput("");
    setIsTyping(false);

    await saveMessage(newMessage);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId: currentDiscussion,
          message: input,
        }),
      });
      const data = await response.json();
      if (data.message) {
        const aiMessage = {
          text: addEmojis(data.message),
          sender: "ai",
          discussionId: currentDiscussion,
        };
        setMessages((prevMessages) => [...prevMessages, aiMessage]);
        await saveMessage(aiMessage);
      } else {
        console.error("Unexpected response structure:", data);
      }
    } catch (error) {
      console.error("Error fetching OpenAI response:", error);
    }
  };
  const saveMessage = async (message) => {
    console.log("saveMessage - Payload envoyé:", message); // Log des données envoyées

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId: message.discussionId,
          text: message.text,
          sender: message.sender,
        }),
      });
      const data = await response.json();
      console.log("saveMessage - Réponse reçue:", data); // Log de la réponse reçue
    } catch (error) {
      console.error(
        "saveMessage - Erreur lors de l’enregistrement du message:",
        error
      );
    }
  };

  const addEmojis = (text) => {
    if (text.includes("happy")) {
      return `${text} ${getEmoji("smile")}`;
    } else if (text.includes("sad")) {
      return `${text} ${getEmoji("disappointed")}`;
    } else if (text.includes("angry")) {
      return `${text} ${getEmoji("angry")}`;
    } else {
      return text;
    }
  };

  const handleInputChange = (event) => {
    setInput(event.target.value);
    setIsTyping(true);
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSend();
    }
  };
  // Au lancement : si tu as déjà des discussions en localStorage, prends la première.
  useEffect(() => {
    if (!currentDiscussion) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/messages/${currentDiscussion}`);
        if (!response.ok) {
          throw new Error("Failed to fetch messages");
        }
        const data = await response.json();
        setMessages(data); // Met à jour les messages dans l'état
      } catch (error) {
        console.error("Erreur lors de la récupération des messages:", error);
      }
    };

    fetchMessages();
  }, [currentDiscussion]); // Exécute cet effet à chaque changement de `currentDiscussion`

  const handleDiscussionChange = (id) => {
    setCurrentDiscussion(id);
  };
  // const handleAddDiscussion = () => {
  //   const id = 'disc-' + Date.now();
  //   const newDisc = { id, name: 'Nouvelle discussion' };
  //   setDiscussions([...discussions, newDisc]);
  //   setCurrentDiscussion(id);
  // };

  const handleMenuOpen = (event, discussionId) => {
    console.log("handleMenuOpen called with discussionId:", discussionId);
    setAnchorEl(event.currentTarget);
    setMenuDiscussionId(discussionId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuDiscussionId(null);
  };

  const [lockedDiscussion, setLockedDiscussion] = useState(null);

const handleRenameDiscussion = (discussionId) => {
  console.log("handleRenameDiscussion called with discussionId:", discussionId);
  const discussion = discussions.find((d) => d.id === discussionId);
  if (discussion) {
    setNewDiscussionName(discussion.name);
    setCurrentDiscussion(discussionId);
    setLockedDiscussion(discussionId); // Verrouille la discussion sélectionnée
    setOpenRenameDialog(true);
  }
};

const handleRenameDialogSave = () => {
  console.log("handleRenameDialogSave called with:", {
    currentDiscussion: lockedDiscussion,
    newDiscussionName,
  });

  if (!lockedDiscussion) {
    console.error("No discussion selected for renaming!");
    return;
  }

  fetch(`/api/conversations/${lockedDiscussion}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: newDiscussionName }),
  })
    .then(() => {
      setDiscussions((prevDiscussions) =>
        prevDiscussions.map((discussion) =>
          discussion.id === lockedDiscussion
            ? { ...discussion, name: newDiscussionName }
            : discussion
        )
      );
      setOpenRenameDialog(false);
      setLockedDiscussion(null); // Déverrouille la discussion
    })
    .catch(console.error);
};
  const handleRenameDialogClose = () => {
    setOpenRenameDialog(false);
  };
  const handleDeleteDiscussion = (id) => {
    fetch(`/api/conversations/${id}`, { method: "DELETE" })
      .then(() => {
        // Supprime la discussion de la liste
        const newDiscs = discussions.filter((d) => d.id !== id);
        setDiscussions(newDiscs);
  
        // Supprime les messages associés à la discussion
        setMessages(messages.filter((m) => m.conversationId !== id));
  
        // Réinitialise la discussion actuelle si elle a été supprimée
        if (currentDiscussion === id) {
          setCurrentDiscussion(newDiscs.length > 0 ? newDiscs[0].id : null);
        }
  
        handleMenuClose(); // Ferme le menu
      })
      .catch(console.error);
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Save Discussion Dialog handlers
  const handleOpenSaveDialog = () => {
    setSaveDiscussionName("");
    setOpenSaveDialog(true);
  };

  const handleCloseSaveDialog = () => {
    setOpenSaveDialog(false);
  };

  const handleSaveDiscussion = () => {
    if (!saveDiscussionName.trim()) return;
    const userId = getUserId();

    fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, name: saveDiscussionName }),
    })
      .then((res) => res.json())
      .then((conv) => {
        // conv.id est un INT auto-incrémenté en base
        setDiscussions((ds) => [...ds, conv]);
        setCurrentDiscussion(conv.id);
        setSaveDiscussionName("");
        setOpenSaveDialog(false);
      })
      .catch(console.error);
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <Box
      sx={{
        display: "flex",
        height: "calc(100vh - 64px)",
        bgcolor: "#f9fafb",
        marginTop: "64px",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <Box
        sx={{
          width: 280,
          bgcolor: "#ffffff",
          color: "#222",
          padding: 3,
          boxSizing: "border-box",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          display: { xs: drawerOpen ? "block" : "none", sm: "block" },
          borderRadius: 3,
        }}
      >
        <Typography
          variant="h5"
          sx={{ marginBottom: 3, color: "#1976d2", fontWeight: 700 }}
        >
          Discussions
        </Typography>
        <List>
          {discussions.map((discussion) => (
            <ListItem
              button
              key={discussion.id}
              onClick={() => handleDiscussionChange(discussion.id)}
              sx={{
                borderRadius: 2,
                mb: 1,
                bgcolor:
                  discussion.id === currentDiscussion
                    ? "#e3f2fd"
                    : "transparent",
                "&:hover": { bgcolor: "#bbdefb" },
                transition: "background-color 0.3s ease",
              }}
            >
              <ListItemText
                primary={discussion.name}
                primaryTypographyProps={{
                  fontWeight:
                    discussion.id === currentDiscussion ? "bold" : "normal",
                  color: "#1976d2",
                }}
              />
              
              <IconButton
                edge="end"
                color="inherit"
                onClick={(e) => handleMenuOpen(e, discussion.id)}
              >
                <MoreVert />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                PaperProps={{ sx: { borderRadius: 2 } }}
              >
               <MenuItem
  onClick={() => {
    console.log("Rename clicked for menuDiscussionId:", menuDiscussionId);
    handleRenameDiscussion(menuDiscussionId);
    handleMenuClose();
  }}
  sx={{ fontFamily: "Poppins, sans-serif" }}
>
  Rename
</MenuItem>
                <MenuItem
                  onClick={() => {
                    handleDeleteDiscussion(menuDiscussionId);
                    handleMenuClose();
                  }}
                  sx={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Delete
                </MenuItem>
              </Menu>
            </ListItem>
          ))}
        </List>
        <Divider sx={{ bgcolor: "#e0e0e0", my: 2 }} />
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddDiscussion}
          startIcon={<Add />}
          sx={{
            marginTop: 2,
            borderRadius: 3,
            boxShadow: "0 4px 10px rgba(25, 118, 210, 0.4)",
            "&:hover": { boxShadow: "0 6px 14px rgba(25, 118, 210, 0.6)" },
            fontWeight: 600,
            fontFamily: "Poppins, sans-serif",
          }}
        >
          Add Discussion
        </Button>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          padding: 3,
          maxWidth: { xs: "100%", sm: "calc(100% - 320px)" },
          marginLeft: { sm: "120px" },
        }}
      >
        {isMobile && (
          <IconButton
            onClick={toggleDrawer}
            sx={{ alignSelf: "flex-start", marginBottom: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#1976d2" }}>
            {discussions.find((d) => d.id === currentDiscussion)?.name ||
              "New Discussion"}
          </Typography>
          {/* <IconButton
            color="primary"
            onClick={handleOpenSaveDialog}
            title="Save Discussion"
          >
            <Save />
          </IconButton> */}
        </Box>
        <Paper
          elevation={6}
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            marginBottom: 3,
            padding: 3,
            borderRadius: 6,
            backgroundColor: "#ffffff",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          }}
          ref={chatContainerRef}
        >
        <List>
  {messages.map((message, index) => (
    <ListItem
      key={index}
      sx={{
        justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
        paddingY: 1,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          padding: 2,
          maxWidth: '60%',
          borderRadius: 4,
          backgroundColor: message.sender === 'user' ? '#1976d2' : '#f5f5f5',
          color: message.sender === 'user' ? '#fff' : '#333',
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
          {message.sender === 'user' ? 'You' : 'AI'}
        </Typography>
        <Typography>{message.text}</Typography>
      </Paper>
    </ListItem>
  ))}
</List>
          {isTyping && (
            <ListItem
              sx={{
                justifyContent: "flex-start",
                position: isMobile ? "absolute" : "relative",
                bottom: isMobile ? 0 : "auto",
                paddingY: 1,
              }}
            >
              <Paper
                elevation={4}
                sx={{
                  padding: 2,
                  maxWidth: { xs: "80%", sm: "60%" },
                  borderRadius: 4,
                  backgroundColor: "#f5f5f5",
                  color: "#333",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  transition: "all 0.3s ease",
                  fontFamily: "Poppins, sans-serif",
                  animation: "fadeIn 0.4s ease",
                }}
              >
                <ListItemText primary="Someone is typing..." />
              </Paper>
            </ListItem>
          )}
        </Paper>
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message..."
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            sx={{
              bgcolor: "#fff",
              borderRadius: 3,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              fontFamily: "Poppins, sans-serif",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#1976d2",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#115293",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#0d3c61",
              },
            }}
          />
          <ButtonSend onClick={handleSend} />
        </Box>
      </Box>
      <Dialog open={openRenameDialog} onClose={handleRenameDialogClose}>
        <DialogTitle sx={{ fontFamily: "Poppins, sans-serif" }}>
          Rename Discussion
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Discussion Name"
            fullWidth
            variant="outlined"
            value={newDiscussionName}
            onChange={(e) => setNewDiscussionName(e.target.value)}
            sx={{ fontFamily: "Poppins, sans-serif" }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleRenameDialogClose}
            color="primary"
            sx={{ fontFamily: "Poppins, sans-serif" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRenameDialogSave}
            color="primary"
            sx={{ fontFamily: "Poppins, sans-serif" }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openSaveDialog} onClose={handleCloseSaveDialog}>
        <DialogTitle sx={{ fontFamily: "Poppins, sans-serif" }}>
          Save Discussion
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Discussion Name"
            fullWidth
            variant="outlined"
            value={saveDiscussionName}
            onChange={(e) => setSaveDiscussionName(e.target.value)}
            sx={{ fontFamily: "Poppins, sans-serif" }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseSaveDialog}
            color="primary"
            sx={{ fontFamily: "Poppins, sans-serif" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveDiscussion}
            color="primary"
            sx={{ fontFamily: "Poppins, sans-serif" }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Box>
  );
};

export default ChatAcad;
