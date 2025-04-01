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
  // Changed to track multiple displayed notes with their states
  const [displayedNotes, setDisplayedNotes] = useState([]); // Array of {noteId, folderId, minimized}

  // Modified to close the note immediately when minimize is clicked
  const toggleMinimize = (noteId) => {
    // Instead of toggling minimize state, directly close the note
    closeNote(noteId);
  };

  // Toggle display of a note (add if not displayed, remove if already displayed)
  const toggleNoteDisplay = (noteId, folderId) => {
    setDisplayedNotes(prev => {
      // Check if note is already being displayed
      const existingNoteIndex = prev.findIndex(note => note.noteId === noteId);
      
      if (existingNoteIndex >= 0) {
        // If note is already displayed, remove it
        return prev.filter(note => note.noteId !== noteId);
      } else {
        // If note is not displayed, add it
        return [...prev, { noteId, folderId, minimized: false }];
      }
    });
  };

  //Delete Note
  const deleteNote = async (noteId, userId, noteTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${noteTitle}"?`)) return;

    try {
      const res = await fetch(`http://localhost:5000/api/notes/${noteId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }), // Send user ID in the body
      });

      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
      // Also remove from displayed notes if it was being displayed
      setDisplayedNotes(prev => prev.filter(note => note.noteId !== noteId));
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  //Delete Folder
  const deletefolder = async (folderId, userId, folderName) => {
    if (!window.confirm(`Are you sure you want to delete "${folderName}"?`)) return;

    try {
      const res = await fetch(`http://localhost:5000/api/folders/${folderId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }), // Make sure `user_id` is sent in the body
      });

      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

      setFolders((prevFolders) => prevFolders.filter((folder) => folder.id !== folderId));
      // Remove any displayed notes from this folder
      setDisplayedNotes(prev => prev.filter(note => note.folderId !== folderId));
    } catch (err) {
      console.error("Error deleting folder:", err);
    }
  };

  //Fetch Folders
  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    if (userId) {
      setUser({ userId, username: sessionStorage.getItem("username") });
      fetchNotes(userId);
      fetchFolders(userId); 
    }
  }, []);

  const fetchFolders = async (userId) => {
    try {
      const res = await fetch(`http://localhost:5000/folders?user_id=${userId}`);
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const data = await res.json();
      setFolders(data);
    } catch (err) {
      console.error("Error fetching folders:", err);
    }
  };

  // Fetch user data from session storage on component mount
  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    const username = sessionStorage.getItem("username");
    if (userId) {
      setUser({ userId, username });
      fetchNotes(userId);
    }
  }, []);

  // Fetch notes from backend API
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

  //ADD NEW NOTE - Modified to refresh folders before showing AddNotes
  const addNewNote = async () => {
    const userId = Number(sessionStorage.getItem("userId"));
    if (isNaN(userId)) {
      return console.error("User ID is missing or invalid. Cannot add a note.");
    }
  
    // Refresh folders list first to get the latest folders including any newly created ones
    try {
      console.log("Refreshing folders before adding note");
      await fetchFolders(userId);
    } catch (err) {
      console.error("Error refreshing folders:", err);
    }
    
    let folderId = 1; // Default folder (General Notes)
    try {
      // Use the freshly fetched folders from state
      console.log("Using folders:", folders);
  
      if (folders.length > 0) {
        folderId = folders[0].id;
      }
    } catch (err) {
      console.error("Error setting folder ID:", err);
    }
  
    const newNote = { title: "Untitled", content: "", folder_id: folderId, user_id: userId };
    console.log("Sending new note data:", newNote);
  
    try {
      const res = await fetch("http://localhost:5000/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNote),
      });
  
      console.log("Response Status:", res.status);
      const responseData = await res.json();
      console.log("Response Data:", responseData);
  
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status} - ${responseData.message}`);
  
      setNotes((prevNotes) => [...prevNotes, responseData]);
      
      // Just show the AddNotes component
      setShowNewNote(true);
    } catch (err) {
      console.error("Error creating note:", err);
    }
  };

  // Modified to update folders list after creating a new folder
  const handleFolderCreated = async () => {
    const userId = sessionStorage.getItem("userId");
    if (userId) {
      await fetchFolders(userId);
      setIsModalOpen(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("usergreeting");
    window.location.href = "/login";  // Redirect to login page
  };
  
  // Close a specific note (remove from displayed notes)
  const closeNote = (noteId) => {
    setDisplayedNotes(prev => prev.filter(note => note.noteId !== noteId));
  };

  return (
    <motion.div
      className="dashboard-container"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -100 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <PanelGroup direction="horizontal">
        <Panel className="left-panel">
          <div className="salutation">
            <div className="nobreak">
              <Greeting /> What's for today {user.username}?
            </div>
            <br></br>
            <div className="qoute">
              Quote Of The Day: <i className="highlight"><Quote/></i>
            </div>
          </div>
          <div className="dashBoardButtons">
            <button className="makeFolder" onClick={() => setIsModalOpen(true)}>
              Create Folder
            </button>
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
                        setFolders((prevFolders) =>
                          prevFolders.map((f) =>
                            f.id === folder.id ? { ...f, isOpen: !f.isOpen } : f
                          )
                        )
                      }
                    >
                      📂 <strong className="foldername">{folder.foldername}</strong>
                    </div>
                    <span className="trash-icon-container">
                      <span
                        className="trash-icon"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevents toggling the folder open/close
                          deletefolder(folder.id, user.userId, folder.foldername)
                        }}
                      >
                        🗑️
                        <span className="tooltipDelete">Delete</span>
                      </span>
                    </span>
                  </div>
                  {folder.isOpen && (
                    <div className="notes-list">
                      {notes.filter((note) => note.folder_id === folder.id).length === 0 ? (
                        <p>📝 No Notes found.</p>
                      ) : (
                        notes
                          .filter((note) => note.folder_id === folder.id)
                          .map((note) => (
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
                                    deleteNote(note.id, user.userId, note.title)
                                  }}
                                >
                                  🗑️
                                  <span className="tooltipDelete">Delete</span>
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
          <button className="image-button" onClick={handleLogout}>
            <img src="src/assets/logout.png" alt="logout"></img>
          </button>
        </Panel>
        <Panel defaultSize={80} minSize={50} className="right-panel">
          {/* Container for multiple notes */}
          <div className="multi-notes-container">
            {/* Add new note component - now passing folders to ensure it has latest list */}
            {showNewNote && <AddNotes 
              notes={notes} 
              setNotes={setNotes} 
              showNewNote={showNewNote} 
              toggleMinimize={toggleMinimize}
              folders={folders} 
            />}
            
            {/* Display all selected notes */}
            {displayedNotes.map((displayedNote) => (
              !displayedNote.minimized ? (
                <DisplayNote
                  key={displayedNote.noteId}
                  noteId={displayedNote.noteId}
                  folderId={displayedNote.folderId}
                  toggleMinimize={() => toggleMinimize(displayedNote.noteId)}
                  closeNote={() => closeNote(displayedNote.noteId)}
                />
              ) : (
                <div key={displayedNote.noteId} className="minimized-note">
                  <span>{notes.find(n => n.id === displayedNote.noteId)?.title || "Untitled Note"}</span>
                </div>
              )
            ))}
          </div>
        </Panel>
      </PanelGroup>
    </motion.div>
  );
};

export default Dashboard;