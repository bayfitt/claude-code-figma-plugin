// Find and Edit Specific Box in Figma
// This script targets the recently created box for modification

const axios = require('axios');

const MCP_SERVER = 'http://localhost:3001';
const SESSION_ID = `box-edit-${Date.now()}`;

// Specific modifications for the user's box
const boxEditCommands = {
  // Make the box more visually appealing
  enhanceBox: {
    action: 'apply-modifications',
    modifications: [{
      nodeId: 'USER_SELECTED_BOX', // Will target whatever is selected
      changes: {
        properties: {
          colors: { 
            background: '#6366F1', // Nice purple color
            border: '#4F46E5' // Darker purple border
          },
          dimensions: { 
            width: 200, 
            height: 120 
          },
          spacing: {
            padding: { top: 16, right: 16, bottom: 16, left: 16 }
          },
          effects: [{
            type: 'drop-shadow',
            color: 'rgba(99, 102, 241, 0.3)',
            offset: { x: 0, y: 4 },
            blur: 12,
            spread: 0
          }]
        }
      }
    }]
  },

  // Add rounded corners and better styling
  styleBox: {
    action: 'apply-modifications',
    modifications: [{
      nodeId: 'USER_SELECTED_BOX',
      changes: {
        properties: {
          cornerRadius: 12,
          colors: { 
            background: '#10B981', // Green
            border: '#059669'
          },
          effects: [{
            type: 'drop-shadow',
            color: 'rgba(16, 185, 129, 0.25)',
            offset: { x: 0, y: 2 },
            blur: 8,
            spread: 0
          }]
        }
      }
    }]
  },

  // Make it a button-like box
  makeButtonBox: {
    action: 'apply-modifications',
    modifications: [{
      nodeId: 'USER_SELECTED_BOX',
      changes: {
        properties: {
          colors: { 
            background: '#F59E0B', // Orange
            border: '#D97706'
          },
          dimensions: { 
            width: 160, 
            height: 48 
          },
          cornerRadius: 8,
          effects: [{
            type: 'drop-shadow',
            color: 'rgba(245, 158, 11, 0.3)',
            offset: { x: 0, y: 2 },
            blur: 4,
            spread: 0
          }]
        }
      }
    }]
  },

  // Add text content to the box
  addTextToBox: {
    action: 'create-component-from-prompt',
    prompt: 'Add text "Click Me" to the selected box with white text, centered',
    framework: 'figma',
    context: {
      targetNodeId: 'USER_SELECTED_BOX',
      operation: 'add-text'
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
    
    console.log('✅ Connected to MCP server');
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return false;
  }
}

async function editUserBox() {
  console.log('📦 Finding and editing your box...\n');

  const connected = await connectToMCP();
  if (!connected) return;

  console.log('🎨 Applying enhancements to your box:');
  
  // Send all the box modifications
  for (const [name, command] of Object.entries(boxEditCommands)) {
    try {
      console.log(`\n🔧 Applying: ${name}`);
      
      const response = await axios.post(`${MCP_SERVER}/mcp-bridge/message`, {
        action: command.action,
        payload: command,
        sessionId: SESSION_ID,
        timestamp: Date.now()
      });

      console.log(`✅ ${name} command sent successfully`);
      
      // Wait between modifications
      await new Promise(resolve => setTimeout(resolve, 800));
      
    } catch (error) {
      console.error(`❌ ${name} failed:`, error.response?.data || error.message);
    }
  }

  console.log('\n🎯 Box editing complete!');
  console.log('\n📋 Instructions for Figma Plugin:');
  console.log('1. Select your box in Figma');
  console.log('2. Run the Claude Code plugin');
  console.log('3. The plugin should show incoming modifications');
  console.log('4. Apply the changes to see your box transform!');
  
  console.log('\n✨ Expected changes:');
  console.log('• Purple color with shadow');
  console.log('• Green styling with rounded corners');  
  console.log('• Orange button-like appearance');
  console.log('• Optional text addition');
}

// Run the box editing
if (require.main === module) {
  editUserBox();
}

module.exports = { boxEditCommands, editUserBox };