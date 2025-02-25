import React, { useEffect, useState } from "react";
import { Rnd } from "react-rnd";
import "./AddNotes.css";

const Note = ({ id, initialContent, initialTitle, onDragStop, folders, onUpdate }) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [selectedFolder, setSelectedFolder] = useState(folders[0]?.id || ""); // Store folder ID

  useEffect(() => {
    if (folders.length > 0) {
      setSelectedFolder(folders[0].id); // Set the default folder ID when folders load
    }
  }, [folders]);

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    onUpdate(id, newTitle, content, selectedFolder);
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    onUpdate(id, title, newContent, selectedFolder);
  };

  const handleFolderChange = (e) => {
    const newFolderId = parseInt(e.target.value, 10);
    setSelectedFolder(newFolderId);
    onUpdate(id, title, content, newFolderId);
  };

  return (
    <Rnd
      default={{ x: 0, y: 30, width: 250, height: 400 }}
      bounds="window"
      className="noteWindow"
      onDragStop={(e, data) => onDragStop(id, data)}
    >
      <div className="note-header">
      <select className="folder-dropdown" value={selectedFolder} onChange={handleFolderChange}>
        {folders.map((folder) => (
          <option key={folder.id} value={folder.id}>
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
        value={content || ""}
        onChange={handleContentChange}
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

  const handleUpdate = (id, newTitle, newContent, folderId) => {
    const userId = sessionStorage.getItem("userId");

    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id ? { ...note, content: newContent, title: newTitle, folder_id: folderId } : note
      )
    );

    fetch(`http://localhost:5000/notes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle, content: newContent, folder: folderId, userId }),
    }).catch((err) => console.error("Error updating note:", err));
  };

  return (
    <div>
      {notes.map((note) => (
        <Note
          key={note.id}
          id={note.id}
          initialContent={note.content}
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
