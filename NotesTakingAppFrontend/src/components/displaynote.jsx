import React, { useEffect, useState, useCallback, useRef } from "react";
import { Rnd } from "react-rnd";
import "./DisplayNote.css";

const DisplayNote = ({
  noteId,
  folderId,
  toggleMinimize,
  notes,
  setNotes,
  folders,
}) => {
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) return setError("User not found");

    const foundNote = notes.find((n) => n.id === noteId);
    if (foundNote) {
      setNote(foundNote);
      setLoading(false);
    } else {
      setError("Note not found.");
      setLoading(false);
    }
  }, [noteId, notes]);

  useEffect(() => {
    if (contentRef.current && note?.content) {
      contentRef.current.innerHTML = note.content;
    }
  }, [note?.id]);

  const handleUpdate = useCallback(
    (updatedFields) => {
      const userId = sessionStorage.getItem("userId");
      if (!note || !userId) return;

      const updatedNote = { ...note, ...updatedFields };
      setNote(updatedNote);

      setNotes((prevNotes) =>
        prevNotes.map((n) => (n.id === note.id ? updatedNote : n))
      );

      fetch(`http://localhost:5000/notes/${noteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: updatedNote.title,
          content: updatedNote.content,
          folder_id: updatedNote.folder_id,
          userId,
        }),
      }).catch((err) => console.error("Error updating note:", err));
    },
    [note, noteId, setNotes]
  );

  const handleContentChange = () => {
    if (contentRef.current) {
      const newContent = contentRef.current.innerHTML;
      handleUpdate({ content: newContent });
    }
  };

  const applyStyle = (style) => {
    document.execCommand(style, false, null);
    handleContentChange();
  };

  const handlePaste = (e) => {
  e.preventDefault(); // stop the default paste
  const text = e.clipboardData.getData("text/plain"); // get plain text
  document.execCommand("insertText", false, text); // insert plain text
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!note) return <p>No note found.</p>;

  return (
    <Rnd
      default={{ x: 0, y: 30, width: 300, height: 250 }}
      bounds="window"
      className="noteWindow"
      enableUserSelectHack={false}
      disableDragging={false}
      dragHandleClassName="note-header"
    >
      <div className="note-header">
        <div className="tooltip">
          <button className="xbutton" onClick={() => toggleMinimize(noteId)}>⏤</button>
          <span className="tooltip-text">Minimize</span>
        </div>
        <select
          className="folderDropdown"
          value={note.folder_id || ""}
          onChange={(e) => handleUpdate({ folder_id: Number(e.target.value) })}
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
        onPaste={handlePaste} 
        value={note.title || ""}
        onChange={(e) => handleUpdate({ title: e.target.value })}
      />

      <div
        className="note-textarea"
        onPaste={handlePaste} 
        contentEditable={true}
        ref={contentRef}
        onInput={handleContentChange}
        onMouseDown={(e) => e.stopPropagation()}
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

export default DisplayNote;
