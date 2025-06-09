import { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import axios from 'axios';

function Suggestions({ schedule }) {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (schedule.length > 0) {
      fetchSuggestions();
    }
  }, [schedule]);

  const fetchSuggestions = async () => {
    try {
      const response = await axios.get('/api/suggestions');
      setSuggestions(response.data);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  };

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h5" gutterBottom>
        Study Suggestions
      </Typography>
      <List>
        {suggestions.map((suggestion, index) => (
          <div key={index}>
            <ListItem>
              <ListItemIcon>
                <SchoolIcon />
              </ListItemIcon>
              <ListItemText
                primary={suggestion.title}
                secondary={suggestion.description}
              />
            </ListItem>
            {index < suggestions.length - 1 && <Divider />}
          </div>
        ))}
      </List>
    </Paper>
  );
}