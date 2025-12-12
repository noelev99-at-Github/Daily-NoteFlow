import React, { useState } from "react";
import ReactDOM from "react-dom";
import { motion } from "framer-motion";
import "./makefolder.css"; // Custom styles

export default function FolderModal({ isOpen, setIsOpen, setFolders }) {
  const [foldername, setFolderName] = useState("");

  if (!isOpen) return null;

  const handleCreateFolder = async () => {
    if (!foldername.trim()) {
      alert("Folder name cannot be empty!");
      return;
    }

    const userId = sessionStorage.getItem("userId");

    if (!userId) {
      alert("User ID is missing! Please log in again.");
      return;
    }

    try {
      console.log("Creating folder with:", { foldername, userId });

      const response = await fetch("http://localhost:5000/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foldername, userId }),
      });

      if (response.ok) {
        const newFolder = await response.json();
        alert("Folder created successfully!");
        
        // Update folder list if setFolders is provided
        if (setFolders) {
          setFolders((prev) => [...prev, newFolder]);
        }

        setFolderName(""); // Clear input field
        setIsOpen(false); // Close modal
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error creating folder:", error);
      alert("Something went wrong!");
    }
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={() => setIsOpen(false)}>
      <motion.div
        className="modal-content"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <button className="close-btn" onClick={() => setIsOpen(false)}>
          <b>x</b>
        </button>
        <div className="modal-header">
          <h3>Create a Folder</h3>
        </div>
        <div className="modal-body">
          <input
            type="text"
            className="folder-input"
            placeholder="Folder Name"
            value={foldername} // ✅ Corrected this
            onChange={(e) => setFolderName(e.target.value)}
          />
        </div>
        <div className="modal-footer">
          <button className="create-btn" onClick={handleCreateFolder}>
            Create
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
