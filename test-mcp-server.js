// Test MCP Server for Figma Plugin
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Store sessions
const sessions = new Map();

// Connect endpoint
app.post('/mcp-bridge/connect', (req, res) => {
  const { sessionId, pluginVersion, timestamp } = req.body;
  
  sessions.set(sessionId, {
    connected: true,
    pluginVersion,
    connectTime: timestamp,
    messages: []
  });
  
  console.log(`📱 Plugin connected: ${sessionId} v${pluginVersion}`);
  
  res.json({
    success: true,
    message: 'Connected to Claude Code MCP server',
    serverVersion: '1.0.0'
  });
});

// Message endpoint
app.post('/mcp-bridge/message', (req, res) => {
  const { action, payload, sessionId } = req.body;
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(400).json({
      success: false,
      error: 'Session not found'
    });
  }
  
  console.log(`💬 Message from ${sessionId}:`, { action, payload: payload?.action || 'unknown' });
  
  // Store message
  session.messages.push({ action, payload, timestamp: Date.now() });
  
  // Mock responses based on action
  let response = { success: true, message: `Processed ${action}` };
  
  switch (action) {
    case 'design-extracted':
      response.data = {
        processed: payload.components?.length || 0,
        message: 'Design specifications received'
      };
      break;
      
    case 'generate-code':
      response.data = {
        code: `// Generated ${payload.designSpec?.framework || 'React'} code\nimport React from 'react';\n\nexport const Component = () => {\n  return <div>Generated from Figma</div>;\n};`,
        files: [{
          name: 'Component.tsx',
          content: 'Generated component code'
        }]
      };
      break;
      
    case 'sync-tokens':
      response.data = {
        tokensSynced: Object.keys(payload.tokens?.colors || {}).length,
        message: 'Design tokens synchronized'
      };
      break;
      
    default:
      response.data = { message: `Action ${action} acknowledged` };
  }
  
  res.json(response);
});

// Receive endpoint (for real-time sync)
app.get('/mcp-bridge/receive/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(400).json({
      success: false,
      error: 'Session not found'
    });
  }
  
  // Mock some changes from Claude Code
  const mockChanges = [
    {
      nodeId: 'mock-node-1',
      changes: {
        properties: {
          colors: { background: '#f0f0f0' },
          dimensions: { width: 200, height: 100 }
        }
      }
    }
  ];
  
  res.json({
    success: true,
    data: Math.random() > 0.8 ? mockChanges : [] // Randomly return changes
  });
});

// Ping endpoint
app.get('/mcp-bridge/ping', (req, res) => {
  res.json({
    success: true,
    message: 'MCP Bridge is running',
    timestamp: Date.now()
  });
});

// Disconnect endpoint
app.post('/mcp-bridge/disconnect', (req, res) => {
  const { sessionId } = req.body;
  
  if (sessions.has(sessionId)) {
    sessions.delete(sessionId);
    console.log(`👋 Plugin disconnected: ${sessionId}`);
  }
  
  res.json({ success: true, message: 'Disconnected' });
});

// Status endpoint
app.get('/status', (req, res) => {
  res.json({
    server: 'Claude Code MCP Bridge',
    status: 'running',
    activeSessions: sessions.size,
    uptime: process.uptime()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Test MCP Server running on http://localhost:${PORT}`);
  console.log(`📊 Status: http://localhost:${PORT}/status`);
});

module.exports = app;