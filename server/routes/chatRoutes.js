// src/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../server');            // ta connexion MySQL (mysql2/promise ou mysql)
const OpenAI = require('openai');
const rateLimit = require('express-rate-limit');



// Create MySQL connection pool
const pool = db.promise();



// GET all conversations for a user
router.get('/conversations/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT id, name, created_at FROM conversations WHERE user_id = ?',
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});
router.get('/messages/:conversationId', async (req, res) => {
  const { conversationId } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT sender, text, created_at FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
      [conversationId]
    );
    res.json(rows); // Retourne les messages au frontend
  } catch (err) {
    console.error('Error in GET /messages/:conversationId:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});
// POST a new conversation
router.post('/conversations', async (req, res) => {
  console.log('POST /conversations called with body:', req.body); // Log de la requête
  const { userId, name } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO conversations (user_id, name) VALUES (?, ?)',
      [userId, name]
    );
    const newConversation = {
      id: result.insertId,
      user_id: userId,
      name,
      created_at: new Date()
    };
    res.status(201).json(newConversation);
  } catch (err) {
    console.error('Error in POST /conversations:', err);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// GET messages for a conversation
router.get('/messages/:conversationId', async (req, res) => {
  const { conversationId } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT sender, text, created_at FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
      [conversationId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST a new message
router.post('/messages', async (req, res) => {
  const { conversationId, sender, text } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO messages (conversation_id, sender, text) VALUES (?, ?, ?)',
      [conversationId, sender, text]
    );
    const newMessage = {
      id: result.insertId,
      conversation_id: conversationId,
      sender,
      text,
      created_at: new Date()
    };
    res.status(201).json(newMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save message' });
  }
});
// PUT update a conversation name
router.put('/conversations/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  console.log("PUT /conversations/:id called with:", { id, name });
  try {
    await pool.query(
      'UPDATE conversations SET name = ? WHERE id = ?',
      [name, id]
    );
    res.status(200).json({ message: 'Conversation updated successfully' });
  } catch (err) {
    console.error('Error in PUT /conversations/:id:', err);
    res.status(500).json({ error: 'Failed to update conversation' });
  }
});
// DELETE a conversation
router.delete('/conversations/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM conversations WHERE id = ?', [id]);
    res.status(200).json({ message: 'Conversation deleted successfully' });
  } catch (err) {
    console.error('Error in DELETE /conversations/:id:', err);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});
module.exports = router;
