import React, { useEffect, useState, useCallback } from "react";
import { Rnd } from "react-rnd";
import "./DisplayNote.css";

const DisplayNote = ({ noteId, folderId, toggleMinimize }) => {
  const [note, setNote] = useState(null);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) return setError("User not found");
    if (!noteId || !folderId) return setError("Invalid note or folder selection.");

    const fetchNoteAndFolders = async () => {
      try {
        const noteUrl = `http://localhost:5000/api/notes/${noteId}?user_id=${userId}&folder_id=${folderId}`;
        const foldersUrl = `http://localhost:5000/api/folders?user_id=${userId}`;

        const [noteRes, foldersRes] = await Promise.all([
          fetch(noteUrl),
          fetch(foldersUrl),
        ]);

        if (!noteRes.ok) throw new Error(`Note fetch failed: ${noteRes.status}`);
        if (!foldersRes.ok) throw new Error(`Folders fetch failed: ${foldersRes.status}`);

        const noteData = await noteRes.json();
        const foldersData = await foldersRes.json();

        setNote(noteData);
        setFolders(foldersData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNoteAndFolders();
  }, [noteId, folderId]);

  const handleUpdate = useCallback(
    async (newTitle, newContent, newFolderId) => {
      const userId = sessionStorage.getItem("userId");
      if (!note || !userId) return;

      const updatedNote = { ...note, title: newTitle, content: newContent, folder_id: newFolderId };
      setNote(updatedNote);

      try {
        const response = await fetch(`http://localhost:5000/api/notes/${noteId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: newTitle,
            content: newContent,
            folder_id: newFolderId,
            user_id: userId,  // Changed from userId to user_id for consistency
          }),
        });

        if (!response.ok) throw new Error(`Update failed: ${response.status}`);
      } catch (err) {
        console.error("Error updating note:", err);
      }
    },
    [note, noteId]
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!note) return <p>No note found.</p>;

  return (
    <Rnd
      default={{ x: 0, y: 30, width: 250, height: 200 }}
      bounds="window"
      className="noteWindow"
      enableUserSelectHack={false}
      disableDragging={false}
    >
      <div className="note-header">
        <div className="tooltip">
          <button className="xbutton" onClick={() => toggleMinimize(noteId)}>⏤</button>
          <span className="tooltip-text">Minimize</span>
        </div>
        <select
          className="folderDropdown"
          value={note.folder_id || ""}
          onChange={(e) => handleUpdate(note.title, note.content, Number(e.target.value))}
        >
          {folders.map((folder) => (
            <option key={folder.id} value={folder.id}>
              {folder.foldername}
            </option>
          ))}
        </select>
      </div>
      <input
        type="text"
        className="notetitle"
        value={note.title}
        onChange={(e) => handleUpdate(e.target.value, note.content, note.folder_id)}
      />
      <textarea
        className="note-textarea"
        value={note.content || ""}
        onChange={(e) => handleUpdate(note.title, e.target.value, note.folder_id)}
        onMouseDown={(e) => e.stopPropagation()} 
      />
    </Rnd>
  );
};

export default DisplayNote;