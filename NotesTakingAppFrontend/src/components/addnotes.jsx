import React, { useState, useRef } from "react";
import { Rnd } from "react-rnd";
import "./addnotes.css";

// --- NOTE COMPONENT ---
const Note = ({ id, initialContent, initialTitle, onDragStop, folders, onUpdate }) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [selectedFolder, setSelectedFolder] = useState(folders[0]?.id || "");
  const [isMinimized, setIsMinimized] = useState(false);
  const contentRef = useRef(null);

  const handleMinimize = () => {
    setIsMinimized((prev) => !prev);
  };

  const handleUpdateState = (newTitle = title, newContent = content, newFolder = selectedFolder) => {
    onUpdate(id, newTitle, newContent, newFolder);
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    handleUpdateState(newTitle, content, selectedFolder);
  };

  const handleContentChange = () => {
    const newContent = contentRef.current.innerHTML;
    setContent(newContent);
    handleUpdateState(title, newContent, selectedFolder);
  };

  const handleFolderChange = (e) => {
    const newFolderId = parseInt(e.target.value, 10);
    setSelectedFolder(newFolderId);
    handleUpdateState(title, content, newFolderId);
  };

  if (isMinimized) return null;

  const applyStyle = (style) => {
    document.execCommand(style, false, null);
    handleContentChange(); 
  };

  const handlePaste = (e) => {
  e.preventDefault(); // stop the default paste
  const text = e.clipboardData.getData("text/plain"); // get plain text
  document.execCommand("insertText", false, text); // insert plain text
  };

  return (
    <Rnd
      default={{ x: 0, y: 30, width: 250, height: 200 }}
      bounds="window"
      className="noteWindowDesign"
      onDragStop={(e, data) => onDragStop(id, data)}
      enableUserSelectHack={false}
      disableDragging={false}
      dragHandleClassName="noteheader"
    >
      <div className="noteheader">
        <div className="tooltip">
          <button className="xbutton" onClick={handleMinimize}>⏤</button>
          <span className="tooltip-text">Minimize</span>
        </div>
        <select className="folderdropdown" value={selectedFolder} onChange={handleFolderChange}>
          {folders.map((folder) => (
            <option key={folder.id} value={folder.id}>
              {folder.foldername}
            </option>
          ))}
        </select>
      </div>

      <input
        type="text"
        onPaste={handlePaste} 
        className="notetitle"
        placeholder="Title..."
        value={title}
        onChange={handleTitleChange}
      />

      <div
        className="notetextarea"
        onPaste={handlePaste} 
        contentEditable={true}
        ref={contentRef}
        onInput={handleContentChange}
        suppressContentEditableWarning={true}
        spellCheck={false}
      />

      <div className="toolbar">
        <button onClick={() => applyStyle('bold')} title="Bold">𝐁</button>
        <button onClick={() => applyStyle('italic')} title="Italic">𝑰</button>
        <button onClick={() => applyStyle('underline')} title="Underline">U̲</button>
        <button onClick={() => applyStyle('strikeThrough')} title="Strikethrough" style={{ textDecoration: 'line-through' }}>S</button>
        <button onClick={() => applyStyle('insertUnorderedList')} title="Bullet List">•</button>
      </div>

    </Rnd>
  );
};

const AddNotes = ({ notes, setNotes, showNewNote, folders }) => {
  const handleUpdate = (id, newTitle, newContent, folderId) => {
    const userId = sessionStorage.getItem("userId");

    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id ? { ...note, title: newTitle, content: newContent, folder_id: folderId } : note
      )
    );

    fetch(`http://localhost:5000/notes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTitle,
        content: newContent,
        folder_id: folderId,
        userId,
      }),
    }).catch((err) => console.error("Error updating note:", err));
  };

  // Find the note with the largest ID
  const latestNote = notes.reduce((maxNote, note) => (note.id > maxNote.id ? note : maxNote), notes[0]);

  return (
    <div>
      {showNewNote && latestNote && (
        <Note
          key={latestNote.id}
          id={latestNote.id}
          initialContent={latestNote.content}
          initialTitle={latestNote.title}
          onDragStop={() => {}}
          folders={folders}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
};

export { Note, AddNotes };
