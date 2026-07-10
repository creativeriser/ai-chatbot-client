import { useLocation } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import "./MainLayout.css";

function MainLayout({ children }) {
  const location = useLocation();
  const isChatRoute = location.pathname === "/chat";

  return (
    <div className="main-layout">
      {!isChatRoute && <Navbar />}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default MainLayout;
