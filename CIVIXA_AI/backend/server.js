require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/agents', require('./routes/agents'));

// Legacy route aliases used by older frontend pages
app.use('/api/agent', require('./routes/agents'));
app.use('/agents', require('./routes/agents'));
app.use('/api/stats', (req, res, next) => { req.url = '/stats'; require('./routes/agents')(req, res, next); });

// Full pipeline complaint submission
app.post('/api/complaints', require('./controllers/agentController').fullPipeline);
app.get('/api/complaints', require('./controllers/agentController').listComplaints);

// Health
app.get('/health', (_, res) => res.json({ status: 'online', service: 'Civixa AI Backend' }));

// MongoDB connect
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('⚠️  MongoDB offline, running without DB:', err.message));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Civixa AI Backend running on http://localhost:${PORT}`));
