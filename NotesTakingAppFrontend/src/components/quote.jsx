import { useState, useEffect } from "react";
import "./quote.css";

function Quote() {
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");

  const fetchQuote = async () => {
    try {
      const response = await fetch("https://api.allorigins.win/get?url=" + encodeURIComponent("https://zenquotes.io/api/random"));
      const data = await response.json();
      const quoteData = JSON.parse(data.contents);
      setQuote(quoteData[0].q);
      setAuthor(quoteData[0].a);
    } catch (error) {
      console.error("Error fetching the quote:", error);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  return (
    <div>
      <p>"{quote}"</p>
      <p>- {author}</p>
    </div>
  );
}

export default Quote;
