import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory store for messages acting as a queue
interface Message {
  id: string;
  to: string;
  body: string;
  status: 'pending' | 'processing' | 'sent' | 'failed';
  timestamp: string;
  updatedAt: string;
}

const messages: Message[] = [];

// Generate a simple unique ID
function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

// --- Dashboard APIs ---

app.get('/api/messages', (req, res) => {
  res.json({ messages });
});

// Enqueue a new message (Clients call this to send SMS)
app.post('/api/messages/send', (req, res) => {
  try {
    const { to, body } = req.body;

    if (!to || !body) {
      return res.status(400).json({ error: 'Missing "to" or "body" in request.' });
    }

    const newMessage: Message = {
      id: generateId(),
      to,
      body,
      status: 'pending',
      timestamp: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    messages.unshift(newMessage);
    res.json(newMessage);
  } catch (error: any) {
    console.error('Error enqueueing SMS:', error);
    res.status(500).json({ error: error.message || 'Failed to enqueue message' });
  }
});

// --- Android Device APIs ---

// Phone polls this endpoint to get messages to send
app.get('/api/queue/pending', (req, res) => {
  // Find the oldest pending message
  const pendingMessage = messages.find(m => m.status === 'pending');
  
  if (pendingMessage) {
    // Mark it as processing so it isn't fetched again immediately
    pendingMessage.status = 'processing';
    pendingMessage.updatedAt = new Date().toISOString();
    res.json({ message: pendingMessage });
  } else {
    // No messages pending
    res.json({ message: null });
  }
});

// Phone calls this endpoint after attempting to send
app.post('/api/queue/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'sent' or 'failed'

  if (!['sent', 'failed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be "sent" or "failed".' });
  }

  const message = messages.find(m => m.id === id);
  if (message) {
    message.status = status;
    message.updatedAt = new Date().toISOString();
    res.json({ success: true, message });
  } else {
    res.status(404).json({ error: 'Message not found' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
