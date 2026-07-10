import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

/* Import Design System */
import "./styles/design-tokens.css";
import "./styles/global.css";
import "./styles/animations.css";
// Remove old App.css
// import "./App.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
