import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./Login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true); // Trigger login animation

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("userId", data.userId);
        sessionStorage.setItem("username", data.username);

        // Trigger success animation
        setLoginSuccess(true);
        
        setTimeout(() => {
          navigate("/dashboard");
          window.location.reload(); // Ensures sessionStorage is read correctly
        }, 800); // Increased delay to allow animation to complete
      } else {
        setIsLoggingIn(false);
        alert(data.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="loginbackground">
      <motion.div
        className="login-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: loginSuccess ? 0 : 1,
          y: loginSuccess ? -100 : 0,
          transition: {
            duration: 0.6,
            ease: "easeInOut",
          },
        }}
      >
        <h2>Daily NoteFlow</h2>
        <motion.form 
          className="login-form"
          onSubmit={handleLogin}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <motion.input
            className="login-input"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          />
          <motion.input
            className="login-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          />
          <motion.button 
            className="login-button"
            type="submit" 
            disabled={isLoggingIn}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {isLoggingIn ? "Logging in..." : "Login"}
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default Login;