import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Panel, PanelGroup } from "react-resizable-panels";
import FolderModal from "./components/makefolder";
import { AddNotes } from "./components/addnotes";
import "./Dashboard.css";

const Dashboard = () => {
  const [user, setUser] = useState({ userId: "", username: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);

  // Fetch user data from session storage on component mount
  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    const username = sessionStorage.getItem("username");
    if (userId) {
      setUser({ userId, username });
      fetchNotes(userId);
      fetchFolders(userId);
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

  const fetchFolders = async (userId) => {
    try {
      const res = await fetch(`http://localhost:5000/folders?user_id=${encodeURIComponent(userId)}`);
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const data = await res.json();
      setFolders(data);
    } catch (err) {
      console.error("Error fetching folders:", err);
    }
  }

  //ADD NEW NOTE
  const addNewNote = async () => {
    const userId = Number(sessionStorage.getItem("userId"));
    if (isNaN(userId)) {
      return console.error("User ID is missing or invalid. Cannot add a note.");
    }
  
    let folderId = folders.length > 0 ? folders[0].id : null;
  
    // If no folders exist, fetch them again before assigning a default folder
    if (!folderId) {
      console.warn("No folders found. Fetching folders again.");
      try {
        const folderRes = await fetch(`http://localhost:5000/folders?user_id=${userId}`);
        if (!folderRes.ok) throw new Error(`HTTP error! Status: ${folderRes.status}`);
        const fetchedFolders = await folderRes.json();
  
        if (fetchedFolders.length > 0) {
          folderId = fetchedFolders[0].id;
        } else {
          alert("No folders available. Cannot add a note.");
          return;
        }
      } catch (err) {
        console.error("Error fetching folders:", err);
        return;
      }
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
        <Panel defaultSize={20} minSize={15} className="left-panel">
          <h2>Hi there, {user.username}!</h2>
          <p>Quote of the day: <i>The future belongs to those who believe in the beauty of their dreams</i></p>
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
                              onClick={() => alert(`Displaying note: ${note.title}`)} // Replace with sticky note display logic
                            >
                              📝 {note.title || "Untitled Note"}
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