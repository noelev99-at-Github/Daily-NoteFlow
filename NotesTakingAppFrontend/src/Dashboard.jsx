import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Panel, PanelGroup } from "react-resizable-panels";
import FolderModal from "./components/makefolder";
import { AddNotes } from "./components/addnotes";
import Quote from "./components/quote";
import DisplayNote from "./components/displaynote";
import Greeting from "./components/greeting";
import "./Dashboard.css";

const Dashboard = () => {
  const [user, setUser] = useState({ userId: "", username: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [showNewNote, setShowNewNote] = useState(false);
  const [displayedNotes, setDisplayedNotes] = useState([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [quoteLoaded, setQuoteLoaded] = useState(false); // ✅ wait for quote

  const toggleMinimize = (noteId) => closeNote(noteId);

  const toggleNoteDisplay = (noteId, folderId) => {
    setDisplayedNotes(prev => {
      const exists = prev.find(note => note.noteId === noteId);
      return exists
        ? prev.filter(note => note.noteId !== noteId)
        : [...prev, { noteId, folderId, minimized: false }];
    });
  };

  const deleteNote = async (noteId, userId, noteTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${noteTitle}"?`)) return;
    try {
      const res = await fetch(`http://localhost:5000/api/notes/${noteId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      setNotes(prev => prev.filter(note => note.id !== noteId));
      setDisplayedNotes(prev => prev.filter(note => note.noteId !== noteId));
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  const deletefolder = async (folderId, userId, folderName) => {
    if (!window.confirm(`Are you sure you want to delete "${folderName}"?`)) return;
    try {
      const res = await fetch(`http://localhost:5000/api/folders/${folderId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      setFolders(prev => prev.filter(folder => folder.id !== folderId));
      setDisplayedNotes(prev => prev.filter(note => note.folderId !== folderId));
    } catch (err) {
      console.error("Error deleting folder:", err);
    }
  };

  const fetchFolders = async (userId) => {
    try {
      const res = await fetch(`http://localhost:5000/folders?user_id=${userId}`);
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const data = await res.json();
      const foldersWithOpen = data.map(folder => ({ ...folder, isOpen: true }));
      setFolders(foldersWithOpen);
    } catch (err) {
      console.error("Error fetching folders:", err);
    }
  };

  const fetchNotes = async (userId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/notes?user_id=${encodeURIComponent(userId)}`);
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const data = await res.json();
      setNotes(data);
    } catch (err) {
      console.error("Error fetching notes:", err);
    }
  };

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    const username = sessionStorage.getItem("username");
    if (userId) {
      setUser({ userId, username });
      fetchNotes(userId);
      fetchFolders(userId);
    }
  }, []);

  const addNewNote = async () => {
    const userId = Number(sessionStorage.getItem("userId"));
    if (isNaN(userId)) return console.error("Invalid user ID.");

    await fetchFolders(userId);

    let folderId = folders.length > 0 ? folders[0].id : 1;
    const newNote = { title: "Untitled", content: "", folder_id: folderId, user_id: userId };

    try {
      const res = await fetch("http://localhost:5000/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNote),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status} - ${data.message}`);

      setNotes(prev => [...prev, data]);
      setShowNewNote(true);
    } catch (err) {
      console.error("Error creating note:", err);
    }
  };

  const handleFolderCreated = async () => {
    const userId = sessionStorage.getItem("userId");
    if (userId) {
      await fetchFolders(userId);
      setIsModalOpen(false);
    }
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      sessionStorage.clear();
      window.location.href = "/login";
    }, 700);
  };

  const closeNote = (noteId) => {
    setDisplayedNotes(prev => prev.filter(note => note.noteId !== noteId));
  };

  return (
    <motion.div
      className="dashboard-container"
      initial={{ opacity: 0, x: -100 }}
      animate={quoteLoaded ? { opacity: 1, x: isLoggingOut ? -500 : 0 } : {}}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <PanelGroup direction="horizontal">
        <Panel className="left-panel">
          <div className="salutation">
            <div className="nobreak">
              <Greeting /> What's for today {user.username}?
            </div>
            <br />
            <div className="qoute">
              Quote Of The Day: <i className="highlight"><Quote onLoad={() => setQuoteLoaded(true)} /></i>
            </div>
          </div>
          <div className="dashBoardButtons">
            <button className="makeFolder" onClick={() => setIsModalOpen(true)}>Create Folder</button>
            <FolderModal
              isOpen={isModalOpen}
              setIsOpen={setIsModalOpen}
              setFolders={setFolders}
              onFolderCreated={handleFolderCreated}
            />
            <button className="addNotes" onClick={addNewNote}>Add Notes</button>
          </div>

          <div className="folderTabContainer">
            <div className="folderTab">
              {folders.length === 0 ? (
                <p>📂 No folders found.</p>
              ) : (
                folders.map((folder) => (
                  <div key={folder.id} className="folder">
                    <div className="folder-header">
                      <div
                        className="folder-name"
                        onClick={() =>
                          setFolders(prev => prev.map(f =>
                            f.id === folder.id ? { ...f, isOpen: !f.isOpen } : f
                          ))
                        }
                      >
                        📂 <strong className="foldername">{folder.foldername}</strong>
                      </div>
                      <span className="trash-icon-container">
                        {folder.foldername !== "General Notes" && (
                          <span
                            className="trash-icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              deletefolder(folder.id, user.userId, folder.foldername);
                            }}
                          >
                            🗑️<span className="tooltipDelete">Delete</span>
                          </span>
                        )}
                      </span>
                    </div>
                    {folder.isOpen && (
                      <div className="notes-list">
                        {notes.filter(note => note.folder_id === folder.id).length === 0 ? (
                          <p>📝 No Notes found.</p>
                        ) : (
                          notes.filter(note => note.folder_id === folder.id)
                               .sort((a, b) => a.id - b.id)
                               .map(note => (
                            <div
                              key={note.id}
                              className={`leftpanelnote-title ${displayedNotes.some(n => n.noteId === note.id) ? 'active-note' : ''}`}
                              onClick={() => toggleNoteDisplay(note.id, folder.id)}
                            >
                              <span>📝 {note.title || "Untitled Note"}</span>
                              <span className="trash-icon-container">
                                <span
                                  className="trash-icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNote(note.id, user.userId, note.title);
                                  }}
                                >
                                  🗑️<span className="tooltipDelete">Delete</span>
                                </span>
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
          <button className="imagebutton" onClick={handleLogout}>
            <img src="src/assets/logout.png" alt="logout" />
          </button>
        </Panel>

        <Panel defaultSize={80} minSize={50} className="right-panel">
          <div className="multi-notes-container">
            {showNewNote && (
              <AddNotes
                notes={notes}
                setNotes={setNotes}
                showNewNote={showNewNote}
                toggleMinimize={toggleMinimize}
                folders={folders}
              />
            )}
            {displayedNotes.map(note =>
              !note.minimized ? (
                <DisplayNote
                  key={note.noteId}
                  noteId={note.noteId}
                  folderId={note.folderId}
                  toggleMinimize={() => toggleMinimize(note.noteId)}
                  closeNote={() => closeNote(note.noteId)}
                  notes={notes}
                  setNotes={setNotes}
                  folders={folders}
                />
              ) : (
                <div key={note.noteId} className="minimized-note">
                  <span>{notes.find(n => n.id === note.noteId)?.title || "Untitled Note"}</span>
                </div>
              )
            )}
          </div>
        </Panel>
      </PanelGroup>
    </motion.div>
  );
};

export default Dashboard;
