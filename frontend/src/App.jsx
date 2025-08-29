import { useState } from "react";
import axios from "axios";

function App() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");

  const sendMessage = async () => {
    const res = await axios.post("http://localhost:5000/chat", { message });
    setReply(res.data.reply);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>AI Chatbot</h1>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Say something..."
      />
      <button onClick={sendMessage}>Send</button>
      <p><b>AI:</b> {reply}</p>
    </div>
  );
}

export default App;
