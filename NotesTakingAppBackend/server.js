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

// CREATE NOTES
app.post("/api/notes", async (req, res) => {
  const { title, content, user_id, folder_id } = req.body;

  console.log("Received request to /api/notes");
  console.log("Raw request body:", req.body); // Log full request body

  if (!user_id || !title) {
    console.error("Validation failed: Missing title or user_id.");
    return res.status(400).json({ message: "Title and User ID are required." });
  }

  console.log("Parsed values:");
  console.log("Title:", title);
  console.log("Content:", content || "");
  console.log("User ID:", user_id);
  console.log("Folder ID:", folder_id || "NULL");

  try {
    console.log("Executing SQL query:");
    console.log(
      `INSERT INTO notes (title, content, user_id, folder_id) VALUES ('${title}', '${content || ""}', ${user_id}, ${folder_id || "NULL"})`
    );

    const newNote = await pool.query(
      "INSERT INTO notes (title, content, user_id, folder_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, content || "", user_id, folder_id || null]
    );

    console.log("New note created successfully:", newNote.rows[0]);
    res.status(201).json(newNote.rows[0]);
  } catch (err) {
    console.error("Error creating note:", err);
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

// Fetch only one note
app.get("/api/notes/:id", async (req, res) => {
  const { id } = req.params;
  const { user_id, folder_id } = req.query;

  if (!user_id || !id) {
    return res.status(400).json({ error: "Missing user_id or note ID" });
  }

  const folderCondition = folder_id ? "AND folder_id = $3" : "";
  const query = `SELECT * FROM notes WHERE id = $1 AND user_id = $2 ${folderCondition}`;
  const params = folder_id ? [id, user_id, folder_id] : [id, user_id];

  console.log(`Fetching note with ID: ${id}, User ID: ${user_id}, Folder ID: ${folder_id}`);

  try {
    const result = await pool.query(query, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Note not found or access denied" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching note:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Fetch folders by user ID
app.get("/api/folders", async (req, res) => {
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

// Updating Data in Note Window
app.put("/notes/:id", async (req, res) => {
  const { id } = req.params;
  const { title, content, folder_id, userId } = req.body;

  if (!id || !folder_id || !userId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const parsedFolderId = parseInt(folder_id, 10);
  if (isNaN(parsedFolderId)) {
    return res.status(400).json({ error: "Invalid folder ID" });
  }

  try {
    const result = await pool.query(
      "UPDATE notes SET title = $1, content = $2, folder_id = $3 WHERE id = $4 AND user_id = $5 RETURNING *",
      [title, content, parsedFolderId, id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Note not found or unauthorized" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating note:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete a note
app.delete("/api/notes/:id", async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;

  try {
    const noteId = parseInt(id, 10);
    if (isNaN(noteId)) {
      return res.status(400).json({ error: "Invalid note ID" });
    }

    if (!user_id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const result = await pool.query(
      "DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING *",
      [noteId, user_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Note not found or unauthorized" });
    }

    res.json({ message: "Note deleted successfully", deletedNote: result.rows[0] });
  } catch (err) {
    console.error("Error deleting note:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Delete a folder
app.delete("/api/folders/:id", async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;

  try {
    const folderId = parseInt(id, 10);
    if (isNaN(folderId)) {
      return res.status(400).json({ error: "Invalid folder ID" });
    }

    if (!user_id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const result = await pool.query(
      "DELETE FROM folders WHERE id = $1 AND user_id = $2 RETURNING *",
      [folderId, user_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Folder not found or unauthorized" });
    }

    res.json({ message: "Folder deleted successfully", deletedFolder: result.rows[0] });
  } catch (err) {
    console.error("Error deleting folder:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});
