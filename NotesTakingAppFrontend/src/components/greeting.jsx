import React, { useState, useEffect } from "react";

const greetings = [
  "Slay, bestie! ✨",
  "Hey diva! 💅",
  "Werk it, queen! 🔥",
  "Yas, legend! 👑",
  "Hiya, sparkle! 🌈",
  "Sup, icon? 😘",
  "Hey gorge! 💖",
  "Glow up, superstar! 🌟",
  "Strut your stuff, honey! 🚶‍♀️",
  "Living for this energy! 💃",
  "Fierce and flawless, always! 💜",
  "Glam it up, darling! 💎",
  "You better werk! 💼",
  "Shining bright like a diamond! 💎",
  "Sparkle on, darling! ✨",
  "Hello, stunning! 😍",
  "Own the moment, love! 🎭",
  "Gorgeous and unbothered! 😌",
  "You are THE moment! 🎤",
  "Serving looks, as always! 🕶",
  "Hello, radiant one! ☀️",
  "Bring the drama, queen! 🎭",
  "Bask in your excellence! 🌟",
  "Wig? Snatched! 💨",
  "Majestic and magical! 🦄",
  "All tea, all shade, all love! ☕",
  "Sass level: Unmatched! 😘",
  "Give them fashion, honey! 🕺",
  "Your aura? Iconic. ✨",
  "Elegance is your middle name! 💃",
  "Snatched for the gods! ⚡",
  "Too glam to give a damn! 💖",
  "You walk like you own the runway! 💁",
  "Confidence on 1000%! 🔥",
  "Your glow is blinding! 🌞",
  "The crown is yours, wear it well! 👑",
  "Power pose, engaged! 📸",
  "Unstoppable and thriving! 🚀",
  "Slay the day, queen! 🌟",
  "Flawless? As always! 💅",
  "Walk in, steal the show, exit. 🎭",
  "Legendary levels of fierce! ⚡",
  "Born to stand out, never to blend in! 🦩",
  "You redefine fabulous! 💖",
  "Glitz, glam, and YOU! 🎀",
  "Step aside, royalty coming through! 🚪",
  "Fashionably late, but always iconic! ⏳",
  "Not just a mood—THE mood! 💃",
  "Your presence? A masterpiece! 🎨",
  "Glamazon in full effect! 💄",
  "Worthy of a standing ovation! 👏",
  "You’re not extra, you’re necessary! 💎",
  "Slay mode activated! 🔛",
  "Glowing brighter than a disco ball! 🪩",
  "Charisma, uniqueness, nerve & talent! 🌈",
  "You, my dear, are show-stopping! 🎭",
  "Walking like the world is your stage! 🎤",
  "Sending you fabulous vibes! 💖",
  "You radiate main character energy! 🎬",
  "All eyes on YOU, honey! 👀",
  "Your aura is straight-up legendary! ✨",
  "Sass? Always. Elegance? Absolutely! 💅",
  "Dripping in finesse! 💎",
  "Confidence level: Beyoncé! 👑",
  "Fierce, flawless, and fabulous! 💃",
  "Darling, you’re pure magic! 🎩",
  "Crown on, attitude strong! 👑",
  "You woke up and chose excellence! 🌟",
  "Flawless from head to toe! 🏆",
  "One word: Iconic. 🎤",
  "You don’t just shine, you sparkle! ✨",
  "Perfection has entered the chat! 💬",
  "Biggest flex? Just being you! 💁",
];

const Greeting = () => {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    let storedGreeting = sessionStorage.getItem("userGreeting");
    if (!storedGreeting) {
      storedGreeting = greetings[Math.floor(Math.random() * greetings.length)];
      localStorage.setItem("userGreeting", storedGreeting);
    }
    setGreeting(storedGreeting);
  }, []);

  return <p>{greeting}</p>;
};

export default Greeting;
