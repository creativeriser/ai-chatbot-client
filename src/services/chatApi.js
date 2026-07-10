import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5100/api";

/**
 * Sends a message + conversation history to the backend and
 * returns the assistant's reply text.
 */
export const sendMessage = async (message, history, image = null) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/chat`, {
      message,
      history,
      image,
    });
    return response.data.reply;
  } catch (error) {
    console.error("Chat API Error:", error);
    throw error;
  }
};
