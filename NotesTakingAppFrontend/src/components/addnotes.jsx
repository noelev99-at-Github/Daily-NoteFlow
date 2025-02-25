import React, { useEffect, useState } from "react";
import { Rnd } from "react-rnd";
import "./AddNotes.css";

const Note = ({ id, initialText, initialTitle, onDragStop, folders, onUpdate }) => {
  const [title, setTitle] = useState(initialTitle);
  const [text, setText] = useState(initialText);
  const [selectedFolder, setSelectedFolder] = useState(folders[0]?.foldername || "");

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    onUpdate(id, e.target.value, text, selectedFolder);
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    onUpdate(id, title, e.target.value, selectedFolder);
  };

  const handleFolderChange = (e) => {
    setSelectedFolder(e.target.value);
    onUpdate(id, title, text, e.target.value);
  };

  return (
    <Rnd
      default={{ x: 100, y: 100, width: 200, height: 200 }}
      bounds="window"
      className="noteWindow"
      onDragStop={(e, data) => onDragStop(id, data)}
    >
      <div className="note-header">
        <select className="folder-dropdown" value={selectedFolder} onChange={handleFolderChange}>
          {folders.map((folder, index) => (
            <option key={index} value={folder.foldername}>
              {folder.foldername}
            </option>
          ))}
        </select>
      </div>
      <input
        type="text"
        className="note-title"
        placeholder="Title..."
        value={title}
        onChange={handleTitleChange}
      />
      <textarea
        className="note-textarea"
        placeholder="Write here..."
        value={text}
        onChange={handleTextChange}
      />
    </Rnd>
  );
};

const AddNotes = ({ notes, setNotes }) => {
  const [folders, setFolders] = useState([]);

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) {
      console.error("No userId found in sessionStorage");
      return;
    }
    fetch(`http://localhost:5000/folders?user_id=${encodeURIComponent(userId)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data) => setFolders(data))
      .catch((err) => console.error("Error fetching folders:", err));
  }, []);

  // Function to update notes in real time
  const handleUpdate = (id, newTitle, newText, folder) => {
    const userId = sessionStorage.getItem("userId");
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id ? { ...note, text: newText, title: newTitle, folder } : note
      )
    );

    // Send update request to backend
    fetch(`http://localhost:5000/notes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, title: newTitle, text: newText, folder, userId }),
    }).catch((err) => console.error("Error updating note:", err));
  };

  return (
    <div>
      {notes.map((note) => (
        <Note
          key={note.id}
          id={note.id}
          initialText={note.text}
          initialTitle={note.title}
          onDragStop={() => {}}
          folders={folders}
          onUpdate={handleUpdate}
        />
      ))}
    </div>
  );
};

export { Note, AddNotes };