import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout.jsx";
import LandingPage from "./components/marketing/LandingPage.jsx";
import ChatInterface from "./components/chat/ChatInterface.jsx";

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/chat" element={<ChatInterface />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
