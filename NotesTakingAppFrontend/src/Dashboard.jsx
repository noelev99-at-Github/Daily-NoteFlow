import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Panel, PanelGroup } from "react-resizable-panels";
import FolderModal from "./components/makefolder";
import { AddNotes } from "./components/addnotes";
import Quote from "./components/quote";
import DisplayNote from "./components/displaynotes";
import "./Dashboard.css";

const Dashboard = () => {
  const [user, setUser] = useState({ userId: "", username: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);

useEffect(() => {
  const userId = sessionStorage.getItem("userId");
  if (userId) {
    setUser({ userId, username: sessionStorage.getItem("username") });
    fetchNotes(userId);
    fetchFolders(userId); // Fetch folders on mount
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

  //ADD NEW NOTE
  const addNewNote = async () => {
    const userId = Number(sessionStorage.getItem("userId"));
    if (isNaN(userId)) {
      return console.error("User ID is missing or invalid. Cannot add a note.");
    }
  
    let folderId = 1; // Default to General Notes (if it exists)
    try {
      const folderRes = await fetch(`http://localhost:5000/folders?user_id=${userId}`);
      if (!folderRes.ok) throw new Error(`HTTP error! Status: ${folderRes.status}`);
      const folders = await folderRes.json();
      if (folders.length > 0) {
        folderId = folders[0].id; // Set first folder as default
      }
    } catch (err) {
      console.error("Error fetching folders:", err);
    }
  
    const newNote = { title: "", content: "", folder_id: folderId, user_id: userId };
  
    try {
      const res = await fetch("http://localhost:5000/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNote),
      });
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const savedNote = await res.json();
      setNotes((prevNotes) => [...prevNotes, savedNote]);
    } catch (err) {
      console.error("Error creating note:", err);
    }
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
          <h2>Hi there, {user.username}!</h2>
          <p className="qoute">Quote Of The Day: <i><Quote/></i></p>
          <div className="dashBoardButtons">
            <button className="makeFolder" onClick={() => setIsModalOpen(true)}>
              Create Folder
            </button>
            <FolderModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
            <button className="addNotes" onClick={addNewNote}>Add Notes</button>
          </div>

          <div className="folderTabContainer">
          <div className="folderTab">
            {folders.length === 0 ? (
              <p>📂 No folders found.</p>
            ) : (
              folders.map((folder) => (
                <div key={folder.id} className="folder">
                  <div
                    className="folder-header"
                    onClick={() =>
                      setFolders((prevFolders) =>
                        prevFolders.map((f) =>
                          f.id === folder.id ? { ...f, isOpen: !f.isOpen } : f
                        )
                      )
                    }
                  >
                    📂 <strong>{folder.foldername}</strong>
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
                              className="leftpanelnote-title"
                              onClick={() => setSelectedNoteId(note.id)} // Store the clicked note ID
                              >
                                <span>📝 {note.title || "Untitled Note"}</span>
                                <span className="trash-icon-container">
                                  <span 
                                    className="trash-icon" 
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevents triggering note click event
                                      alert(`Deleting note: ${note.title}`); // Replace with delete function
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
        </Panel>
        <Panel defaultSize={80} minSize={50} className="right-panel">
          <AddNotes notes={notes} setNotes={setNotes} />
        </Panel>
      </PanelGroup>
    </motion.div>
  );
};

export default Dashboard;