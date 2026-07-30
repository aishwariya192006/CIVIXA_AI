const mongoose = require('mongoose');

const agentResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  agentName: { type: String, required: true },
  agentId: { type: Number, required: true },
  input: { type: mongoose.Schema.Types.Mixed, required: true },
  output: { type: mongoose.Schema.Types.Mixed, required: true },
  executionTime: { type: Number, default: 0 },
  status: { type: String, enum: ['success', 'error'], default: 'success' },
}, { timestamps: true });

module.exports = mongoose.model('AgentResult', agentResultSchema);
