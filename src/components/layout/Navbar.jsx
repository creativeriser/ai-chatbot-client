import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import "./Navbar.css";

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener("scroll", handleScroll);
    // Initial check in case the page is loaded already scrolled
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`navbar ${isScrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <Sparkles className="navbar-logo-icon" />
          <span className="navbar-logo-text">CampusAI</span>
        </Link>
        <nav className="navbar-nav">
          <a href="https://github.com/creativeriser/ai-chatbot-client" target="_blank" rel="noopener noreferrer" className="navbar-link">
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
