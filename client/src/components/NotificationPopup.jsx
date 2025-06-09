import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import botImage from '../components/bot.png'; // Path to bot.png

const quotes = [
  "Keep pushing forward!",
  "Believe in yourself!",
  "You can do it!",
  "انت قدها! 🚀",
  "Stay positive, work hard!",
  "Never give up!",
  "النجاح خير من الانتقام! 😎",
  "Dream big!",
  "Stay focused and never quit!",
  "ما تستسلمش أبدا! 🔥",
  "Success is the best revenge!",
  "Your only limit is you!",
   "حقق أحلامك! ✨",
  "Make it happen!"
];

function NotificationPopup({ onClose }) {
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <Box 
      sx={{
        position: 'fixed',
        bottom: 100,
        right: 16,
        width: 250,
        background: 'linear-gradient(135deg, #f9f9f9 30%, #e3f2fd 90%)',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)',
        borderRadius: '10px',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        animation: 'fadeIn 0.5s',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <img src={botImage} alt="Bot" style={{ width: 40, height: 40 }} />
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
      <Typography variant="body1" sx={{ marginTop: 1, textAlign: 'center' }}>
        {randomQuote}
      </Typography>
    </Box>
  );
}

export default NotificationPopup;