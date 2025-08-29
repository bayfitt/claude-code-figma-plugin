// Test Edit Commands for Figma Plugin
// This script simulates Claude Code sending design modification commands

const axios = require('axios');

const MCP_SERVER = 'http://localhost:3001';
const SESSION_ID = `edit-test-${Date.now()}`;

// Test modification commands
const editCommands = {
  // Change button color from blue to green
  changeButtonColor: {
    action: 'apply-modifications',
    modifications: [{
      nodeId: 'SELECTED_BUTTON', // Will be replaced with actual selected node
      changes: {
        properties: {
          colors: { background: '#34C759' }, // Green color
          effects: []
        }
      }
    }]
  },

  // Resize component
  resizeComponent: {
    action: 'apply-modifications', 
    modifications: [{
      nodeId: 'SELECTED_NODE',
      changes: {
        properties: {
          dimensions: { width: 160, height: 50 }
        }
      }
    }]
  },

  // Change text styling
  updateTypography: {
    action: 'apply-modifications',
    modifications: [{
      nodeId: 'SELECTED_TEXT',
      changes: {
        properties: {
          typography: {
            family: 'Inter',
            size: 18,
            weight: 600
          },
          colors: { text: '#FF3B30' } // Red text
        }
      }
    }]
  },

  // Add spacing/padding
  addSpacing: {
    action: 'apply-modifications',
    modifications: [{
      nodeId: 'SELECTED_FRAME',
      changes: {
        properties: {
          spacing: {
            padding: { top: 20, right: 20, bottom: 20, left: 20 }
          }
        }
      }
    }]
  },

  // Create new component from AI prompt
  createFromPrompt: {
    action: 'create-component-from-prompt',
    prompt: 'Create a login form with email input, password input, and submit button',
    framework: 'react',
    context: {
      figmaFileId: 'current-file',
      currentPageId: 'current-page'
    }
  }
};

async function connectToMCP() {
  try {
    const response = await axios.post(`${MCP_SERVER}/mcp-bridge/connect`, {
      sessionId: SESSION_ID,
      pluginVersion: '1.0.0',
      timestamp: Date.now()
    });
    
    console.log('✅ Connected to MCP server:', response.data.message);
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return false;
  }
}

async function sendEditCommand(commandName) {
  const command = editCommands[commandName];
  if (!command) {
    console.error(`❌ Unknown command: ${commandName}`);
    return;
  }

  try {
    console.log(`\n🔧 Sending command: ${commandName}`);
    console.log('📤 Command data:', JSON.stringify(command, null, 2));

    const response = await axios.post(`${MCP_SERVER}/mcp-bridge/message`, {
      action: command.action,
      payload: command,
      sessionId: SESSION_ID,
      timestamp: Date.now()
    });

    console.log('✅ Command sent successfully:', response.data.message);
    if (response.data.data) {
      console.log('📋 Response data:', response.data.data);
    }
  } catch (error) {
    console.error(`❌ Command failed:`, error.response?.data || error.message);
  }
}

async function testFileEditing() {
  console.log('🎨 Testing Figma File Editing via Claude Code Bridge\n');

  // Connect to MCP server
  const connected = await connectToMCP();
  if (!connected) return;

  console.log('\n📝 Available edit commands:');
  Object.keys(editCommands).forEach((cmd, i) => {
    console.log(`${i + 1}. ${cmd}`);
  });

  console.log('\n🚀 Testing edit commands...\n');

  // Test each command
  for (const commandName of Object.keys(editCommands)) {
    await sendEditCommand(commandName);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait between commands
  }

  console.log('\n✅ All edit commands sent!');
  console.log('\n📖 Instructions for Figma:');
  console.log('1. Select a button/component in Figma');
  console.log('2. Run the Claude Code plugin');
  console.log('3. Check for incoming modifications');
  console.log('4. Apply modifications to see changes in Figma');
}

// Run the test
if (require.main === module) {
  testFileEditing();
}

module.exports = { editCommands, sendEditCommand, connectToMCP };