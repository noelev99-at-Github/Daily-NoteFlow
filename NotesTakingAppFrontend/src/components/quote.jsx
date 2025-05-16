import { useState, useEffect } from "react";
import "./quote.css";

function Quote({ onLoad }) {
  const [quote, setQuote] = useState("Life is what happens when you're busy making other plans.");
  const [author, setAuthor] = useState("John Lennon");
  const [isLoading, setIsLoading] = useState(true);

  // Fallback quotes to use if API fails
  const fallbackQuotes = [
    { q: "Life is what happens when you're busy making other plans.", a: "John Lennon" },
    { q: "The purpose of our lives is to be happy.", a: "Dalai Lama" },
    { q: "Get busy living or get busy dying.", a: "Stephen King" },
    { q: "You only live once, but if you do it right, once is enough.", a: "Mae West" },
    { q: "Many of life's failures are people who did not realize how close they were to success when they gave up.", a: "Thomas A. Edison" },
    { q: "Your time is limited, don't waste it living someone else's life.", a: "Steve Jobs" },
    { q: "The way to get started is to quit talking and begin doing.", a: "Walt Disney" },
    { q: "If you look at what you have in life, you'll always have more. If you look at what you don't have in life, you'll never have enough.", a: "Oprah Winfrey" },
    { q: "The future belongs to those who believe in the beauty of their dreams.", a: "Eleanor Roosevelt" },
    { q: "It does not matter how slowly you go as long as you do not stop.", a: "Confucius" },
    { q: "Everything you've ever wanted is on the other side of fear.", a: "George Addair" },
    { q: "Success is not final, failure is not fatal: it is the courage to continue that counts.", a: "Winston Churchill" },
    { q: "Hardships often prepare ordinary people for an extraordinary destiny.", a: "C.S. Lewis" },
    { q: "Believe you can and you're halfway there.", a: "Theodore Roosevelt" },
    { q: "When you have a dream, you've got to grab it and never let go.", a: "Carol Burnett" },
    { q: "The only person you are destined to become is the person you decide to be.", a: "Ralph Waldo Emerson" },
    { q: "Don't limit yourself. Many people limit themselves to what they think they can do. You can go as far as your mind lets you.", a: "Mary Kay Ash" },
    { q: "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle.", a: "Steve Jobs" },
    { q: "You don't have to be great to start, but you have to start to be great.", a: "Zig Ziglar" },
    { q: "It always seems impossible until it's done.", a: "Nelson Mandela" }
  ];

  const getRandomFallbackQuote = () => {
    const randomIndex = Math.floor(Math.random() * fallbackQuotes.length);
    return fallbackQuotes[randomIndex];
  };

  const fetchQuote = async () => {
    setIsLoading(true);
    try {
      // The API call is correctly formatted, but let's add more robust error checking
      const proxyUrl = "https://api.allorigins.win/get?url=";
      const targetUrl = encodeURIComponent("https://zenquotes.io/api/random");
      
      const response = await fetch(proxyUrl + targetUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if we got a valid response from the proxy
      if (!data || !data.contents) {
        throw new Error("Invalid response from proxy");
      }
      
      // Proper error handling for JSON parsing
      try {
        const quoteData = JSON.parse(data.contents);
        
        // Validate the response format
        if (Array.isArray(quoteData) && quoteData.length > 0 && quoteData[0].q && quoteData[0].a) {
          setQuote(quoteData[0].q);
          setAuthor(quoteData[0].a);
        } else {
          // If response format is unexpected, use fallback
          const fallback = getRandomFallbackQuote();
          setQuote(fallback.q);
          setAuthor(fallback.a);
        }
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
        // Use fallback if JSON parsing fails
        const fallback = getRandomFallbackQuote();
        setQuote(fallback.q);
        setAuthor(fallback.a);
      }
    } catch (error) {
      console.error("Error fetching the quote:", error);
      // Use fallback if fetch fails
      const fallback = getRandomFallbackQuote();
      setQuote(fallback.q);
      setAuthor(fallback.a);
    } finally {
      setIsLoading(false);
      if (onLoad) onLoad(); // Notify Dashboard that quote is ready
    }
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  return (
    <div className="quote-container">
      {isLoading ? (
        <p>Loading inspiration...</p>
      ) : (
        <>
          <p className="quote-text">"{quote}"</p>
          <p className="quote-author">- {author}</p>
        </>
      )}
    </div>
  );
}

export default Quote;