import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Container,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import "./todo.css";

const TodoList = () => {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [suggestions, setSuggestions] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(null);
  const [newTaskValue, setNewTaskValue] = useState("");
  // New modal for adding points
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [badgeEarned, setBadgeEarned] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchSuggestions(user.id);
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/todo_lists/${user.id}`
      );
      setTasks(response.data);
      localStorage.setItem("tasks", JSON.stringify(response.data));
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const fetchSuggestions = async (userId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/suggestions/${userId}`
      );
      setSuggestions(response.data.suggestions);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const markTodoListAsModified = async () => {
    try {
      await axios.post(`http://localhost:5000/api/todo/modified`, {
        userId: user.id,
      });
    } catch (error) {
      console.error(
        "Error updating todo list status:",
        error
      );
    }
  };

  const handleAddTask = async () => {
    if (task.trim() === "") {
      setError("Add a task!");
      return;
    }
    try {
      // Add task to server
      await axios.post("http://localhost:5000/api/todo/add", {
        userId: user.id,
        task,
      });
  
      // Reload all tasks from server
      await fetchTasks();
  
      setTask("");
      setError("");
      markTodoListAsModified();
  
      // Show modal for 5 points
      setPointsEarned(5);
      setShowPointsModal(true);
      setTimeout(() => {
        setShowPointsModal(false);
        setPointsEarned(null);
      }, 20000);
  
      // Gamification points
      await axios.post("http://localhost:5000/api/gamification/addPoints", {
        userId: user.id,
        points: 5,
      });
  
      // Update challenges
      await axios.post("http://localhost:5000/api/gamification/updateChallenge", {
        userId: user.id,
        challenge: "Super Organized",
      });
      await axios.post("http://localhost:5000/api/gamification/updateChallenge", {
        userId: user.id,
        challenge: "Planner of the Week",
      });
  
      // Update user
      const updatedUser = await axios.get(
        `http://localhost:5000/api/user/${user.id}`
      );
      localStorage.setItem("user", JSON.stringify(updatedUser.data));
      setUser(updatedUser.data);
  
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };
  
  
  const toggleCompleted = async (index) => {
    const newTasks = [...tasks];
    const taskToUpdate = newTasks[index];
    const previousCompleted = taskToUpdate.completed;
    const updatedCompleted = !previousCompleted;
    newTasks[index] = { ...taskToUpdate, completed: updatedCompleted };
    setTasks(newTasks);
    try {
      const response = await axios.put(
        `http://localhost:5000/api/todo_lists/update/${taskToUpdate.id}`,
        {
          task: taskToUpdate.task,
          completed: updatedCompleted,
          previousCompleted,
        }
      );
      markTodoListAsModified();
  
      // If task just completed, show modal for 10 points
      if (updatedCompleted && !previousCompleted) {
        setPointsEarned(10);
        setShowPointsModal(true);
        setTimeout(() => {
          setShowPointsModal(false);
          setPointsEarned(null);
        }, 20000);
      }
  
      // Check if a badge was awarded
      if (response.data.badge) {
        setBadgeEarned(response.data.badge);
        setShowBadgeModal(true);
      }
    } catch (error) {
      console.error("Error updating task:", error);
      newTasks[index] = { ...taskToUpdate, completed: previousCompleted };
      setTasks(newTasks);
    }
  };
  const handleDeleteTask = async () => {
    const taskToDelete = tasks[currentTaskIndex];
    try {
      await axios.delete(
        `http://localhost:5000/api/todo_lists/delete/${taskToDelete.id}`
      );
      const newTasks = tasks.filter((_, i) => i !== currentTaskIndex);
      setTasks(newTasks);
      markTodoListAsModified();
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleEditTask = async () => {
    const updatedTasks = [...tasks];
    updatedTasks[currentTaskIndex].task = newTaskValue;
    setTasks(updatedTasks);
    try {
      await axios.put(
        `http://localhost:5000/api/todo_lists/update/${tasks[currentTaskIndex].id}`,
        {
          task: newTaskValue,
          completed: updatedTasks[currentTaskIndex].completed,
        }
      );
      markTodoListAsModified();
      setShowEditModal(false);
    } catch (error) {
      console.error("Error editing task:", error);
    }
  };

  return (
    <Container className="todo-container">
      <Typography variant="h4" className="todo-title">
        TODO LIST
      </Typography>

      <TextField
        label="Add a task"
        variant="outlined"
        value={task}
        onChange={(e) => setTask(e.target.value)}
        sx={{ width: "100%", marginBottom: 2 }}
      />

      <Button
        variant="contained"
        className="todo-button"
        onClick={handleAddTask}
      >
        Add
      </Button>

      {error && (
        <Typography sx={{ color: "red", marginTop: 2 }}>{error}</Typography>
      )}

      <List className="todo-list">
        {tasks.map((taskItem, index) => (
          <ListItem
            key={taskItem.id}
            className={`task ${taskItem.completed ? "completed" : ""}`}
            sx={{ display: "flex", alignItems: "center" }}
          >
           <ListItemText
  primary={taskItem.task}
  secondary={
    taskItem.due_date 
      ? `Added on: ${new Date(taskItem.due_date).toLocaleDateString()}`
      : "Date not available"
  }
/>

            <div style={{ display: "flex", alignItems: "center" }}>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCompleted(index);
                }}
              >
                <CheckIcon />
              </IconButton>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentTaskIndex(index);
                  setNewTaskValue(taskItem.task);
                  setShowEditModal(true);
                }}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentTaskIndex(index);
                  setShowDeleteModal(true);
                }}
              >
                <DeleteIcon />
              </IconButton>
            </div>
          </ListItem>
        ))}
      </List>

      {showDeleteModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Confirm Deletion</h2>
            <p>Are you sure you want to delete this task?</p>
            <Button onClick={handleDeleteTask}>Yes</Button>
            <Button onClick={() => setShowDeleteModal(false)}>No</Button>
          </div>
        </div>
      )} 

      {showEditModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit Task</h2>
            <TextField
              value={newTaskValue}
              onChange={(e) => setNewTaskValue(e.target.value)}
              fullWidth
            />
            <Button onClick={handleEditTask}>Save</Button>
            <Button onClick={() => setShowEditModal(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Points Modal */}
      <Dialog
  open={showPointsModal}
  onClose={() => {
    setShowPointsModal(false);
    setPointsEarned(null);
  }}
  sx={{ zIndex: 2000 }}
>
  <DialogTitle sx={{ position: "relative", textAlign: "center" }}>
    🎉 Points added 🎉
    <IconButton
      onClick={() => {
        setShowPointsModal(false);
        setPointsEarned(null);
      }}
      sx={{ position: "absolute", right: 8, top: 8 }}
    >
      <CloseIcon />
    </IconButton>
  </DialogTitle>
  <DialogContent sx={{ textAlign: "center", position: "relative" }}>
    {/* Animated garlands */}
    <div className="guirlande-container">
      <div className="guirlande"></div>
      <div className="guirlande"></div>
    </div>

    {/* Main message */}
    <Typography variant="h6" sx={{ marginTop: 4 }}>
      🎊 You earned {pointsEarned} point
      {pointsEarned > 1 ? "s" : ""} ! 🎊
    </Typography>

    {/* Animated emojis */}
    <div className="emoji-container">
      <span className="emoji">🎉</span>
      <span className="emoji">✨</span>
      <span className="emoji">🎈</span>
      <span className="emoji">🎊</span>
    </div>
  </DialogContent>
</Dialog>
<Dialog
  open={showBadgeModal}
  onClose={() => {
    setShowBadgeModal(false);
    setBadgeEarned(null);
  }}
  sx={{ zIndex: 2000 }}
>
  <DialogTitle sx={{ position: "relative", textAlign: "center" }}>
    🎉 Congratulations! 🎉
    <IconButton
      onClick={() => {
        setShowBadgeModal(false);
        setBadgeEarned(null);
      }}
      sx={{ position: "absolute", right: 8, top: 8 }}
    >
      <CloseIcon />
    </IconButton>
  </DialogTitle>
  <DialogContent sx={{ textAlign: "center", position: "relative" }}>
    <Typography variant="h6" sx={{ marginTop: 4 }}>
      You earned the badge: <strong>{badgeEarned}</strong> 🏅
    </Typography>
    <div className="emoji-container">
      <span className="emoji">🎉</span>
      <span className="emoji">🏅</span>
      <span className="emoji">🎊</span>
    </div>
  </DialogContent>
</Dialog>
    </Container>
  );
};

export default TodoList;
