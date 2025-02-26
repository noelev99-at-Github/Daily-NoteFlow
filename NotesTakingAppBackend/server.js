require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// LOGIN API - Authenticates user and returns a JWT token
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (user.rows.length === 0) return res.status(401).json({ message: "User not found." });

    const foundUser = user.rows[0];
    const validPassword = await bcrypt.compare(password, foundUser.password);
    if (!validPassword) return res.status(401).json({ message: "Wrong password." });

    const token = jwt.sign({ userId: foundUser.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, userId: foundUser.id, username: foundUser.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// CREATE FOLDER API - Adds a new folder for the user
app.post("/api/folders", async (req, res) => {
  const { foldername, userId } = req.body;

  if (!foldername || !userId) {
    return res.status(400).json({ error: "Folder name and user ID are required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO folders (foldername, user_id) VALUES ($1, $2) RETURNING *",
      [foldername, userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// FETCH FOLDERS FROM BACKEND
app.get("/folders", async (req, res) => {
  const userId = req.query.user_id;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const result = await pool.query("SELECT * FROM folders WHERE user_id = $1", [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});


// CREATE NOTE API - Adds a new note to the database
app.post("/api/notes", async (req, res) => {
  const { title, content, user_id, folder_id } = req.body;
  
  console.log("Received data:", req.body); // Debugging log

  if (!user_id || !title) {
    return res.status(400).json({ message: "Title and User ID are required." });
  }

  try {
    const newNote = await pool.query(
      "INSERT INTO notes (title, content, user_id, folder_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, content || "", user_id, folder_id || null]
    );
    res.status(201).json(newNote.rows[0]);
  } catch (err) {
    console.error("Error creating note:", err); // Log full error
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET NOTES API - Retrieves notes for the logged-in user
app.get("/api/notes", async (req, res) => {
  try {
    const userId = parseInt(req.query.user_id, 10);
    if (isNaN(userId)) return res.status(400).json({ error: "Invalid userId" });

    const result = await pool.query("SELECT * FROM notes WHERE user_id = $1", [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching notes:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Updating Data in Note Window
app.put("/notes/:id", async (req, res) => {
  const { id } = req.params;
  const { title, content, folder, userId } = req.body;

  console.log("Received Update Request:");
  console.log("Note ID:", id);
  console.log("Title:", title);
  console.log("Content:", content);
  console.log("Folder:", folder);
  console.log("User ID:", userId);

  if (isNaN(folder)) {  
    return res.status(400).json({ error: "Invalid folder ID" });
  }

  try {
    if (!id || !title || !content || !folder || !userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const folderId = isNaN(folder) ? null : parseInt(folder, 10);

    if (!folderId) {
      return res.status(400).json({ error: "Invalid folder ID" });
    }

    console.log("Executing query with values:", [title, content, folderId, id, userId]);


    const result = await pool.query(
      "UPDATE notes SET title = $1, content = $2, folder_id = $3 WHERE id = $4 AND user_id = $5 RETURNING *",
      [title, content, folderId, id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Note not found or unauthorized" });
    }

    console.log("Updated Note:", result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating note:", err);
    res.status(500).json({ error: "Server error" });
  }
});

