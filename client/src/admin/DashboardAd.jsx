import React, { useState, useEffect } from "react";
import { Grid, Card, CardContent, Typography, Box, LinearProgress } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";
import axios from "axios";
import PeopleIcon from "@mui/icons-material/People";
import DescriptionIcon from "@mui/icons-material/Description";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import TaskAltIcon from "@mui/icons-material/TaskAlt";

const Dashboard = () => {
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
  };

  const [data, setData] = useState([
    { name: "Users", value: 0, color: colorPalette.primary, icon: <PeopleIcon fontSize="large" /> },
    { name: "Shared Docs", value: 0, color: colorPalette.info, icon: <DescriptionIcon fontSize="large" /> },
    { name: "Imported Schedule", value: 0, color: colorPalette.success, icon: <CalendarMonthIcon fontSize="large" /> },
    { name: "Completed Tasks", value: 0, color: colorPalette.warning, icon: <TaskAltIcon fontSize="large" /> },
  ]);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/statistics");
      const stats = response.data;
      setData([
        {  name: "Users", value: stats.userCount || 120, color: colorPalette.primary, icon: <PeopleIcon fontSize="large" /> },
        { name: "Shared Docs", value: stats.docCount || 85, color: colorPalette.info, icon: <DescriptionIcon fontSize="large" /> },
        { name: "Imported Schedule", value: stats.ScheduleCount || 47, color: colorPalette.success, icon: <CalendarMonthIcon fontSize="large" /> },
        { name: "Completed Tasks", value: stats.taskCount || 193, color: colorPalette.warning, icon: <TaskAltIcon fontSize="large" /> },
      ]);
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques :", error);
      // Valeurs par défaut en cas d'erreur
      setData([
        { name: "Users", value: 120, color: colorPalette.primary, icon: <PeopleIcon fontSize="large" /> },
        { name: "Shared Docs", value: 85, color: colorPalette.info, icon: <DescriptionIcon fontSize="large" /> },
        { name: "Imported Schedule", value: 47, color: colorPalette.success, icon: <CalendarMonthIcon fontSize="large" /> },
        { name: "Completed Tasks", value: 193, color: colorPalette.warning, icon: <TaskAltIcon fontSize="large" /> },
      ]);
    }
  };

  // Calculer le total pour les pourcentages
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{ bgcolor: "white", p: 2, borderRadius: 1, boxShadow: 2 }}>
          <Typography variant="subtitle2" color="textPrimary">
            {payload[0].name}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Value: {payload[0].value}
          </Typography>
        </Box>
      );
    }
    return null;
  };
  
  return (
    <Box sx={{ p: 3, bgcolor: colorPalette.background, minHeight: "100vh" }}>
      <Typography variant="h4" fontWeight="bold" color={colorPalette.text} sx={{ mb: 4 }}>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {data.map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: "100%",
                borderRadius: 2,
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                },
                overflow: "hidden",
              }}
            >
              <Box sx={{ height: "8px", bgcolor: item.color }} />
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: `${item.color}20`,
                      color: item.color,
                      borderRadius: "50%",
                      width: 48,
                      height: 48,
                      mr: 2,
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography variant="h6" color={colorPalette.text}>
                    {item.name}
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold" color={colorPalette.text}>
                  {item.value}
                </Typography>
                <Box mt={2}>
                  <LinearProgress
                    variant="determinate"
                    value={(item.value / (Math.max(...data.map(d => d.value)) * 1.2)) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: `${item.color}20`,
                      "& .MuiLinearProgress-bar": {
                        bgcolor: item.color,
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

<Grid item xs={12} md={8}>
  <Card
    sx={{
      borderRadius: 2,
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      p: 2,
    }}
  >
    <CardContent>
      <Typography variant="h6" fontWeight="bold" color={colorPalette.text} mb={3}>
      Distribution of statistics
      </Typography>
      <ResponsiveContainer width="100%" height={360}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 50 }} 
        >
          <XAxis
            dataKey="name"
            tick={{ fill: colorPalette.text, fontSize: 12 }} 
            axisLine={{ stroke: colorPalette.text + "40" }}
            tickLine={false}
            interval={0}
            angle={-45} 
            textAnchor="end" 
          />
          <YAxis
            tick={{ fill: colorPalette.text }}
            axisLine={{ stroke: colorPalette.text + "40" }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="value"
            radius={[4, 4, 0, 0]}
            barSize={40}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
</Grid>

        <Grid item xs={12} md={4}>
  <Card
    sx={{
      borderRadius: 2,
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      p: 2,
      height: "100%",
    }}
  >
    <CardContent>
      <Typography variant="h6" fontWeight="bold" color={colorPalette.text} mb={3}>
      Proportional distribution
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            innerRadius={60}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ marginTop: "10px" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
</Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;