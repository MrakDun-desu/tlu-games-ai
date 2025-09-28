import { initializeApp } from 'firebase/app';
import { DataSnapshot, getDatabase, off, onChildAdded, push, ref } from 'firebase/database';
import { useEffect, useRef, useState } from 'react';
import "./App.css";

interface Message {
  id?: string
  username: string
  message: string
}

const firebaseConfig = {
  apiKey: "AIzaSyBNGsVn4x0MfSIc27bLI7xb3xrAkvutSK0",
  authDomain: "tlu-ai-in-games.firebaseapp.com",
  databaseURL: "https://tlu-ai-in-games-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "tlu-ai-in-games",
  storageBucket: "tlu-ai-in-games.firebasestorage.app",
  messagingSenderId: "1024932856602",
  appId: "1:1024932856602:web:e0c591e8a17eb0d3be62a3"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const messagesRef = ref(db, "messages");

const App = () => {
  const [messages, setMessages] = useState<Array<Message>>([]);
  const [currentMessage, setCurrentMessage] = useState<Message>({ username: "", message: "" });
  const messageField = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const callback = (snapshot: DataSnapshot) => {
      const newMessage: Message | null = snapshot.val();
      if (newMessage) {
        setMessages((prev) => [...prev, { ...newMessage, id: snapshot.key! }]);
      }
    }

    onChildAdded(messagesRef, callback);
    return () => {
      off(messagesRef, "child_added", callback);
    };
  }, []);

  const sendMessage = async () => {
    if (currentMessage.message === null || currentMessage.message.trim() == "") {
      return;
    }
    await push(messagesRef, { message: currentMessage.message.trim(), username: currentMessage.username });
    setCurrentMessage({ username: currentMessage.username, message: "" });
    messageField.current?.focus();
  }

  return (
    <div className="content">
      <h1>TLU AI in Games - Mrak's Chat</h1>
      <form className="message-form" onSubmit={e => { e.preventDefault(); sendMessage(); }}>
        <div className="username-container">
          <label htmlFor="username">Username</label>
          <input
            name="username"
            type="text"
            placeholder="Username"
            value={currentMessage.username}
            onChange={(e) => setCurrentMessage({ ...currentMessage, username: e.target.value })}
          />
        </div>
        <textarea
          placeholder="Message"
          value={currentMessage.message}
          ref={messageField}
          onChange={(e) => setCurrentMessage({ ...currentMessage, message: e.target.value })}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) sendMessage() }}
        />
        <button type="submit">Send message</button>
      </form>
      <h2>Chat:</h2>
      <div className="chat-container">
        {
          messages.map(({ username, message, id }) => {
            return (
              <div className="chat-message" key={id}>
                <strong>{username}: </strong><span>{message}</span>
              </div>
            );
          })
        }
      </div>
    </div>
  );
}

export default App
