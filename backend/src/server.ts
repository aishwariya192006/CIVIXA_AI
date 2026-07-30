import http from 'http';
import app from './app';
import dotenv from 'dotenv';
import { initSocket } from './utils/socket';
import { startReminderAgent } from './agents/ReminderAgent';

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

import { initAIOpsWorkers } from './workers/AIOpsWorker';

// Start Background AI Agents
startReminderAgent();
initAIOpsWorkers();
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
