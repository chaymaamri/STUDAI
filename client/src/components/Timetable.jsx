import React from 'react';
import { Paper, Typography, Box, List, ListItem, ListItemText } from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';

function Timetable({ schedule = [] }) {
  const dayMap = {
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6,
    'Sunday': 0
  };

  const events = schedule.map(course => {
    const [startHour, startMinute] = course.time.split('-')[0].split(':');
    const [endHour, endMinute] = course.time.split('-')[1]?.split(':') || [startHour, startMinute];
    return {
      title: `${course.name}\n${course.instructor}`,
      start: `2023-01-01T${startHour}:${startMinute}:00`, // Replace with actual date
      end: `2023-01-01T${endHour}:${endMinute}:00`, // Replace with actual date
      daysOfWeek: [dayMap[course.day]], // Adjust to match FullCalendar's day format
    };
  });

  console.log('Rendering Events:', events); // Log the events being rendered

  const revisionSuggestions = schedule.map(course => {
    return `Revise ${course.name} with ${course.instructor} on ${course.day} at ${course.time}`;
  });

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h5" gutterBottom>
        Academic Schedule
      </Typography>
      <FullCalendar
        plugins={[timeGridPlugin, dayGridPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'timeGridWeek,timeGridDay'
        }}
        events={events}
        height="auto"
        allDaySlot={false}
        slotMinTime="08:00:00"
        slotMaxTime="22:00:00"
      />
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Revision Suggestions
        </Typography>
        <List>
          {revisionSuggestions.map((suggestion, index) => (
            <ListItem key={index}>
              <ListItemText primary={suggestion} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Paper>
  );
}

export default Timetable;