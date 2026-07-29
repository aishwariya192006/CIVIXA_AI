const axios = require('axios');
const AgentResult = require('../models/AgentResult');

const AGENTS = {
  1: { url: process.env.AGENT1_URL || 'http://127.0.0.1:8001', endpoint: '/understand', name: 'Complaint Understanding Agent' },
  2: { url: process.env.AGENT2_URL || 'http://127.0.0.1:8002', endpoint: '/detect-duplicate', name: 'Duplicate Detection Agent' },
  3: { url: process.env.AGENT3_URL || 'http://127.0.0.1:8003', endpoint: '/route', name: 'Department Routing Agent' },
  4: { url: process.env.AGENT4_URL || 'http://127.0.0.1:8004', endpoint: '/priority', name: 'Priority Assessment Agent' },
  5: { url: process.env.AGENT5_URL || 'http://127.0.0.1:8005', endpoint: '/assign', name: 'Officer Assignment Agent' },
  6: { url: process.env.AGENT6_URL || 'http://127.0.0.1:8006', endpoint: '/verify', name: 'Resolution Verification Agent' },
};

// Mock responses when Python agents are offline
const MOCKS = {
  1: (input) => ({
    complaint_summary: `Citizen reported: ${input.content?.substring(0, 80)}...`,
    issue_type: 'Infrastructure Damage', department: 'Roads', location: input.location || 'Not specified',
    severity: 'High', confidence: 0.91, keywords: ['pothole', 'road damage', 'accident risk', 'infrastructure'],
    citizen_intent: 'Wants immediate repair of the damaged road infrastructure'
  }),
  2: () => ({ is_duplicate: false, matched_complaint_id: null, similarity: 12.4, decision: 'New Complaint' }),
  3: (input) => {
    let dept = 'Roads';
    const text = ((input.issue_type || '') + ' ' + (input.complaint_summary || '')).toLowerCase();
    if (text.includes('water')) dept = 'Water Supply';
    else if (text.includes('electric') || text.includes('power') || text.includes('light')) dept = 'Electricity';
    else if (text.includes('garbage') || text.includes('waste') || text.includes('sanitation')) dept = 'Waste Management';
    else if (text.includes('drain')) dept = 'Drainage';
    return { department: dept, confidence: 0.93, reason: `Based on the complaint about "${input.complaint_summary?.substring(0, 50)}", this falls under ${dept} department jurisdiction.` };
  },
  4: () => ({ priority: 'High', score: 78, risk: 'High', reason: 'Multiple people affected, infrastructure damage present', affected_population: '500-1000 people', recommended_response_time: '24 hours' }),
  5: (input) => {
    const loc = (input.location || 'Unknown').toLowerCase();
    let hash = 0;
    for (let i = 0; i < loc.length; i++) hash = loc.charCodeAt(i) + ((hash << 5) - hash);
    
    const firstNames = ['Rajesh', 'Deepak', 'Priya', 'Karthik', 'Amit', 'Vikram', 'Sneha', 'Arun', 'Ramesh', 'Sanjay'];
    const lastNames = ['Kumar', 'Verma', 'Nair', 'Raja', 'Sharma', 'Singh', 'Reddy', 'Patel', 'Iyer', 'Menon'];
    
    const name = `${firstNames[Math.abs(hash) % firstNames.length]} ${lastNames[Math.abs(hash * 3) % lastNames.length]}`;
    const id = `OFF${Math.abs(hash) % 900 + 100}`;
    const score = 80 + (Math.abs(hash) % 20);
    
    return { assigned_officer: name, officer_id: id, assignment_score: score, reason: `Best match based on proximity to ${input.location} and current availability`, estimated_response_time: '2 hours' };
  },
  6: (input) => {
    const feedback = (input.citizen_confirmation || '').toLowerCase();
    const note = (input.resolution_note || '').toLowerCase();
    
    const isNegativeFeedback = feedback.includes('no ') || feedback.includes('not') || feedback.includes('still') || feedback.includes('fake') || feedback.includes('bad');
    const isVagueNote = note.length < 15 || note.includes('test') || note.includes('overlooping');
    
    if (isNegativeFeedback || isVagueNote) {
      return { 
        verified: false, 
        confidence: 0.92, 
        decision: 'Reopen', 
        reason: isNegativeFeedback ? "Citizen feedback contradicts the officer's resolution claim." : "Officer resolution note is vague, insufficient, or potentially fake.", 
        resolution_quality: 'Poor', 
        citizen_satisfaction: isNegativeFeedback ? 'Dissatisfied' : 'Pending' 
      };
    }
    
    return { 
      verified: true, 
      confidence: 0.89, 
      decision: 'Close', 
      reason: 'Resolution note is detailed and matches original complaint. Citizen feedback confirms resolution.', 
      resolution_quality: 'Good', 
      citizen_satisfaction: 'Satisfied' 
    };
  },
};

const runAgent = async (agentId, payload, userId) => {
  const agent = AGENTS[agentId];
  const start = Date.now();
  let output, status = 'success';

  try {
    const res = await axios.post(`${agent.url}${agent.endpoint}`, payload, { timeout: 15000 });
    output = res.data;
  } catch {
    // Use mock when agent is offline
    output = { ...MOCKS[agentId](payload), _mock: true, _note: 'Python agent offline - showing demo response' };
    status = 'success';
  }

  const executionTime = Date.now() - start;

  // Save to DB (non-blocking)
  AgentResult.create({ userId: userId || null, agentName: agent.name, agentId, input: payload, output, executionTime, status }).catch(() => {});

  return { output, executionTime, agentName: agent.name };
};

exports.understand = async (req, res) => {
  try {
    const result = await runAgent(1, req.body, req.user?._id);
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.duplicate = async (req, res) => {
  try {
    const payload = {
      new_complaint: { id: 'new', summary: req.body.new_summary, location: req.body.new_location, department: req.body.department || '' },
      existing_complaints: req.body.existing_complaints || [
        { id: 'ex1', summary: 'Broken water pipe on MG Road flooding the street', location: 'MG Road, Bangalore', department: 'Water Supply' },
        { id: 'ex2', summary: 'Garbage not collected in Koramangala for 5 days', location: 'Koramangala', department: 'Waste Management' },
        { id: 'ex3', summary: 'Street light not working near school', location: 'Anna Nagar, Chennai', department: 'Street Lighting' },
        { id: 'ex4', summary: 'Pothole on main road causing accidents', location: 'MG Road, Bangalore', department: 'Roads' },
      ]
    };
    const result = await runAgent(2, payload, req.user?._id);
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.route = async (req, res) => {
  try {
    const result = await runAgent(3, req.body, req.user?._id);
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.priority = async (req, res) => {
  try {
    const result = await runAgent(4, req.body, req.user?._id);
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.assign = async (req, res) => {
  try {
    const officers = req.body.officers || [
      { id: 'O1', name: 'Rajesh Kumar', department: req.body.department || 'Roads', expertise: ['road repair', 'pothole', 'asphalt'], current_workload: 2, location: 'Zone A', availability: 'Available', past_performance_score: 0.91 },
      { id: 'O2', name: 'Priya Sharma', department: req.body.department || 'Roads', expertise: ['infrastructure', 'road maintenance'], current_workload: 4, location: 'Zone B', availability: 'Available', past_performance_score: 0.85 },
      { id: 'O3', name: 'Amit Singh', department: req.body.department || 'Roads', expertise: ['road construction', 'drainage'], current_workload: 1, location: 'Zone C', availability: 'Busy', past_performance_score: 0.78 },
    ];
    const result = await runAgent(5, { ...req.body, officers }, req.user?._id);
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.verify = async (req, res) => {
  try {
    const result = await runAgent(6, req.body, req.user?._id);
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.history = async (req, res) => {
  try {
    const { agentId, limit = 10 } = req.query;
    const filter = agentId ? { agentId: Number(agentId) } : {};
    const results = await AgentResult.find(filter).sort({ createdAt: -1 }).limit(Number(limit));
    res.json(results);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteHistory = async (req, res) => {
  try {
    await AgentResult.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.stats = async (req, res) => {
  try {
    const total = await AgentResult.countDocuments();
    const byAgent = await AgentResult.aggregate([{ $group: { _id: '$agentId', count: { $sum: 1 }, name: { $first: '$agentName' } } }]);
    const recent = await AgentResult.find().sort({ createdAt: -1 }).limit(5);
    res.json({ total, byAgent, recent });
  } catch { res.json({ total: 0, byAgent: [], recent: [] }); }
};

// Full pipeline: runs agents 1-5 in sequence
exports.fullPipeline = async (req, res) => {
  try {
    const { input_type = 'text', content, location = '' } = req.body;
    const userId = req.user?._id;

    // Agent 1: Understand
    const a1 = await runAgent(1, { input_type, content, location }, userId);
    const understood = a1.output;

    // Agent 2: Duplicate check
    const a2 = await runAgent(2, {
      new_complaint: { id: 'new', summary: understood.complaint_summary || content, location, department: understood.department || '' },
      existing_complaints: [
        { id: 'ex1', summary: 'Broken water pipe on MG Road flooding the street', location: 'MG Road, Bangalore', department: 'Water Supply' },
        { id: 'ex2', summary: 'Garbage not collected in Koramangala for 5 days', location: 'Koramangala', department: 'Waste Management' },
        { id: 'ex3', summary: 'Street light not working near school', location: 'Anna Nagar, Chennai', department: 'Street Lighting' },
        { id: 'ex4', summary: 'Pothole on main road causing accidents', location: 'MG Road, Bangalore', department: 'Roads' },
      ]
    }, userId);

    if (a2.output.is_duplicate) {
      return res.json({ status: 'duplicate', duplicate_info: a2.output, understood });
    }

    // Agent 3: Route
    const a3 = await runAgent(3, {
      complaint_summary: understood.complaint_summary || content,
      issue_type: understood.issue_type || '',
      keywords: understood.keywords || [],
      location
    }, userId);
    const routing = a3.output;

    // Agent 4: Priority
    const a4 = await runAgent(4, {
      complaint_summary: understood.complaint_summary || content,
      issue_type: understood.issue_type || '',
      department: routing.department || understood.department || '',
      location,
      keywords: understood.keywords || [],
      severity: understood.severity || ''
    }, userId);
    const priority_details = a4.output;

    // Agent 5: Assign
    const dept = routing.department || understood.department || 'Roads';
    const a5 = await runAgent(5, {
      complaint_summary: understood.complaint_summary || content,
      department: dept,
      priority: priority_details.priority || 'Medium',
      location,
      issue_type: understood.issue_type || '',
      officers: [
        { id: 'O1', name: 'Rajesh Kumar', department: dept, expertise: ['road repair', 'pothole', 'asphalt'], current_workload: 2, location: 'Zone A', availability: 'Available', past_performance_score: 0.91 },
        { id: 'O2', name: 'Priya Sharma', department: dept, expertise: ['infrastructure', 'road maintenance'], current_workload: 4, location: 'Zone B', availability: 'Available', past_performance_score: 0.85 },
        { id: 'O3', name: 'Amit Singh', department: dept, expertise: ['road construction', 'drainage'], current_workload: 1, location: 'Zone C', availability: 'Busy', past_performance_score: 0.78 },
      ]
    }, userId);
    const assignment = a5.output;

    const { v4: uuidv4 } = require('uuid');
    res.json({
      status: 'success',
      complaint: {
        id: uuidv4(),
        complaint_summary: understood.complaint_summary,
        issue_type: understood.issue_type,
        department: routing.department || understood.department,
        location: understood.location || location,
        severity: understood.severity,
        priority: priority_details.priority,
        assigned_officer: assignment.assigned_officer,
        officer_id: assignment.officer_id,
        routing,
        priority_details,
        assignment,
        keywords: understood.keywords,
        citizen_intent: understood.citizen_intent,
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.listComplaints = async (req, res) => {
  try {
    const results = await AgentResult.find({ agentId: 1 }).sort({ createdAt: -1 }).limit(20);
    res.json(results.map(r => ({ id: r._id, ...r.output, createdAt: r.createdAt })));
  } catch { res.json([]); }
};

exports.agentHealth = async (req, res) => {
  const results = {};
  for (const [id, agent] of Object.entries(AGENTS)) {
    try {
      const r = await axios.get(`${agent.url}/health`, { timeout: 3000 });
      results[id] = { status: 'online', name: agent.name, ...r.data };
    } catch {
      results[id] = { status: 'offline', name: agent.name };
    }
  }
  res.json(results);
};
