import { Button, Card, Flex, Heading, Strong, TextField } from '@radix-ui/themes';
import { Box } from '@radix-ui/themes/src/index.js';
import { initializeApp } from 'firebase/app';
import { DataSnapshot, getDatabase, off, onChildAdded, push, ref } from 'firebase/database';
import { useEffect, useRef, useState } from 'react';

interface Message {
  id: string
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
  const [currentMessage, setCurrentMessage] = useState<Message>({ id: "", username: "", message: "" });
  const messageField = useRef<HTMLInputElement>(null);

  useEffect(() => {
    var callback = (snapshot: DataSnapshot) => {
      const newMessage: { username: string, message: string } | null = snapshot.val();
      if (newMessage) {
        setMessages((prev) => [...prev, { ...newMessage, id: snapshot.key! }]);
      }
    }

    onChildAdded(messagesRef, callback);
    return () => {
      off(messagesRef, "child_added", callback);
    };
  }, []);

  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (currentMessage.message === null || currentMessage.message.trim() == "") {
      return;
    }
    await push(messagesRef, { message: currentMessage.message.trim(), username: currentMessage.username });
    setCurrentMessage({ id: "", username: currentMessage.username, message: "" });
    messageField.current?.focus();
  }

  return (
    <>
      <Flex align="center" width="100%" direction="column">
        <Flex width="1024px" direction="column" gap="1em">
          <Heading align="center">TLU AI in Games - Mrak's Chat</Heading>
          <form onSubmit={sendMessage}>
            <Flex gap="1em">
              <TextField.Root
                placeholder="Username"
                value={currentMessage.username}
                onChange={(e) => setCurrentMessage({ ...currentMessage, username: e.target.value })}
              />
              <Box flexGrow="1">
                <TextField.Root
                  placeholder="Message"
                  value={currentMessage.message}
                  ref={messageField}
                  flex-grow="true"
                  onChange={(e) => setCurrentMessage({ ...currentMessage, message: e.target.value })}
                />
              </Box>
              <Button type="submit">Send message</Button>
            </Flex>
          </form>
          <Heading as="h2" size="5">Chat:</Heading>
          <Flex direction="column" gap="0.5em">
            {messages.map(({ username, message, id }) => <Card key={id}><Strong>{username}: </Strong>{message}</Card>)}
          </Flex>
        </Flex>
      </Flex>
    </>
  );
}

export default App
