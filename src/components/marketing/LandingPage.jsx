import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, MessageSquare, Mic, Zap } from "lucide-react";
import "./LandingPage.css";

function LandingPage() {
  const navigate = useNavigate();
  const [mockupStep, setMockupStep] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setMockupStep(1), 2500); // AI finishes typing
    const timer2 = setTimeout(() => setMockupStep(0), 8000); // Loop back
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [mockupStep]);

  return (
    <div className="landing-page animate-fade-in">
      <div className="bg-glow bg-glow-primary"></div>
      <div className="bg-glow bg-glow-secondary"></div>
      
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-badge animate-slide-up">
            <span className="badge-dot"></span>
            CampusAI v2.0 is live
          </div>
          
          <h1 className="hero-title animate-slide-up" style={{ animationDelay: "100ms" }}>
            The Next Generation of <br />
            <span className="text-gradient">Campus Assistance</span>
          </h1>
          
          <p className="hero-subtitle animate-slide-up" style={{ animationDelay: "200ms" }}>
            Experience lightning-fast, intelligent conversations with our advanced AI.
            Whether you prefer typing or talking, CampusAI understands you perfectly.
          </p>
          
          <div className="hero-actions animate-slide-up" style={{ animationDelay: "300ms" }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate("/chat")}>
              Start Chatting <ArrowRight className="btn-icon-right" />
            </button>
            <a href="#features" className="btn btn-secondary btn-lg">
              Learn More
            </a>
          </div>
        </div>

        <div className="hero-visual animate-slide-up" style={{ animationDelay: "400ms" }}>
          <div className="glass-panel mockup-panel animate-float">
            <div className="mockup-header">
              <div className="mockup-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
            <div className="mockup-body">
              <div className="mockup-message ai">
                Hi! I'm CampusAI. How can I help you with your studies today?
              </div>
              <div className="mockup-message user">
                Can you explain quantum computing simply?
              </div>
              {mockupStep === 0 ? (
                <div className="mockup-message ai typing">
                  <span className="dot"></span><span className="dot"></span><span className="dot"></span>
                </div>
              ) : (
                <div className="mockup-message ai animate-fade-in">
                  Think of a regular computer like a switch (on/off). A quantum computer is like a spinning coin—it can be both at once! This lets it solve certain complex math problems exponentially faster. 🚀
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <section id="features" className="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper"><MessageSquare /></div>
            <h3>Natural Conversations</h3>
            <p>Engage in fluid, context-aware dialogue that feels entirely human.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper"><Mic /></div>
            <h3>Voice Enabled</h3>
            <p>Speak your mind directly to the AI, and have it read replies aloud.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper"><Zap /></div>
            <h3>Lightning Fast</h3>
            <p>Powered by the Gemini API for near-instantaneous, high-quality responses.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
