// MCP Server for Claude-Figma Design Bridge
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory command queue
let designCommandQueue = [];
let responseQueue = [];

// Claude Design Command Parser
class DesignCommandParser {
  static parseNaturalLanguage(instruction) {
    const commands = [];
    const lowerInstruction = instruction.toLowerCase();
    
    // Special component patterns
    if (/drivechain|blockchain|chain/i.test(lowerInstruction)) {
      return this.createDrivechainIcon(lowerInstruction);
    }
    
    if (/button|btn/i.test(lowerInstruction)) {
      return this.createButton(lowerInstruction);
    }
    
    if (/badge|notification/i.test(lowerInstruction)) {
      return this.createBadge(lowerInstruction);
    }
    
    if (/heading|title/i.test(lowerInstruction)) {
      return this.createHeading(lowerInstruction);
    }
    
    // Shape detection patterns
    const shapePatterns = {
      rectangle: /(rectangle|rect|box|square)/i,
      ellipse: /(circle|ellipse|oval)/i,
      text: /(text|label)/i,
      frame: /(frame|container|group)/i
    };
    
    // Color patterns
    const colorPatterns = {
      red: /red/i,
      blue: /blue/i,
      green: /green/i,
      yellow: /yellow/i,
      black: /black/i,
      white: /white/i,
      gray: /(gray|grey)/i,
      purple: /purple/i,
      orange: /orange/i
    };
    
    // Position/size extraction
    const positionMatch = lowerInstruction.match(/at position (\\d+),\\s*(\\d+)/);
    const sizeMatch = lowerInstruction.match(/size (\\d+)x(\\d+)|width (\\d+) height (\\d+)/);
    const radiusMatch = lowerInstruction.match(/radius (\\d+)/);
    const largeMatch = /(large|big|huge)/i.test(lowerInstruction);
    const bottomMatch = /(bottom|below)/i.test(lowerInstruction);
    
    // Determine shape type
    let shapeType = 'rectangle'; // default
    for (const [shape, pattern] of Object.entries(shapePatterns)) {
      if (pattern.test(lowerInstruction)) {
        shapeType = shape;
        break;
      }
    }
    
    // Determine color
    let fillColor = { r: 0.5, g: 0.5, b: 0.5 }; // default gray
    for (const [color, pattern] of Object.entries(colorPatterns)) {
      if (pattern.test(lowerInstruction)) {
        fillColor = this.getColorRGB(color);
        break;
      }
    }
    
    // Determine size
    let width = 150, height = 100;
    if (largeMatch) {
      width = 200;
      height = 200;
    }
    if (sizeMatch) {
      width = parseInt(sizeMatch[1] || sizeMatch[3]);
      height = parseInt(sizeMatch[2] || sizeMatch[4]);
    }
    
    // Determine position
    let x = 100, y = 100;
    if (positionMatch) {
      x = parseInt(positionMatch[1]);
      y = parseInt(positionMatch[2]);
    } else if (bottomMatch) {
      y = 500; // Place at bottom
    }
    
    // Build command
    const command = {
      type: 'create',
      shape: shapeType,
      properties: {
        x,
        y,
        width,
        height,
        fills: [{ type: 'SOLID', color: fillColor }]
      }
    };
    
    // Add shape-specific properties
    if (shapeType === 'ellipse' && radiusMatch) {
      const radius = parseInt(radiusMatch[1]);
      command.properties.width = radius * 2;
      command.properties.height = radius * 2;
    }
    
    if (shapeType === 'text') {
      const textMatch = lowerInstruction.match(/(?:text|saying|with) ["'](.*?)["']/);
      command.properties.text = textMatch ? textMatch[1] : 'Sample Text';
      command.properties.fontSize = largeMatch ? 24 : 16;
    }
    
    commands.push(command);
    return commands;
  }
  
  static createDrivechainIcon(instruction) {
    const largeMatch = /(large|big|huge)/i.test(instruction);
    const bottomMatch = /(bottom|below)/i.test(instruction);
    
    const size = largeMatch ? 200 : 150;
    const y = bottomMatch ? 500 : 100;
    
    // Create multiple components for the drivechain icon
    const commands = [];
    
    // Background circle
    commands.push({
      type: 'create',
      shape: 'ellipse',
      properties: {
        x: 100,
        y,
        width: size,
        height: size,
        fills: [{ type: 'SOLID', color: { r: 0.08, g: 0.14, b: 0.26 } }], // Dark navy
        strokes: [{ type: 'SOLID', color: { r: 0.31, g: 0.27, b: 0.9 } }], // Purple
        strokeWeight: 2
      }
    });
    
    // Central block
    const blockSize = size * 0.15;
    commands.push({
      type: 'create',
      shape: 'rectangle',
      properties: {
        x: 100 + (size - blockSize) / 2,
        y: y + (size - blockSize) / 2,
        width: blockSize,
        height: blockSize,
        fills: [{ type: 'SOLID', color: { r: 0.96, g: 0.62, b: 0.04 } }], // Orange
        cornerRadius: 4
      }
    });
    
    // Chain links (simplified)
    const linkPositions = [
      { x: 100 + size * 0.2, y: y + size * 0.3 },
      { x: 100 + size * 0.7, y: y + size * 0.3 },
      { x: 100 + size * 0.2, y: y + size * 0.7 },
      { x: 100 + size * 0.7, y: y + size * 0.7 }
    ];
    
    linkPositions.forEach(pos => {
      commands.push({
        type: 'create',
        shape: 'ellipse',
        properties: {
          x: pos.x,
          y: pos.y,
          width: 20,
          height: 15,
          fills: [],
          strokes: [{ type: 'SOLID', color: { r: 0.31, g: 0.27, b: 0.9 } }],
          strokeWeight: 3
        }
      });
    });
    
    return commands;
  }
  
  static createButton(instruction) {
    const commands = [];
    const positionMatch = instruction.match(/positioned at (\d+),(\d+)/);
    const widthMatch = instruction.match(/(\d+)px wide/);
    const heightMatch = instruction.match(/(\d+)px tall/);
    const colorMatch = instruction.match(/(blue|red|green|purple|orange)/i);
    
    const x = positionMatch ? parseInt(positionMatch[1]) : 100;
    const y = positionMatch ? parseInt(positionMatch[2]) : 100;
    const width = widthMatch ? parseInt(widthMatch[1]) : 200;
    const height = heightMatch ? parseInt(heightMatch[1]) : 50;
    const color = colorMatch ? this.getColorRGB(colorMatch[1].toLowerCase()) : this.getColorRGB('blue');
    
    // Create button background with rounded corners
    commands.push({
      type: 'create',
      shape: 'rectangle',
      properties: {
        x, y, width, height,
        fills: [{ type: 'SOLID', color }],
        cornerRadius: 8,
        effects: [{
          type: 'DROP_SHADOW',
          color: { r: 0, g: 0, b: 0, a: 0.15 },
          offset: { x: 0, y: 2 },
          radius: 4,
          visible: true
        }]
      }
    });
    
    // Add button text
    commands.push({
      type: 'create',
      shape: 'text',
      properties: {
        x: x + 20,
        y: y + height/2 - 8,
        text: 'Button',
        fontSize: 16,
        fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }],
        fontName: { family: 'Inter', style: 'Medium' }
      }
    });
    
    return commands;
  }
  
  static createBadge(instruction) {
    const commands = [];
    const positionMatch = instruction.match(/positioned at (\d+),(\d+)/);
    const sizeMatch = instruction.match(/(\d+)px diameter/);
    const colorMatch = instruction.match(/(red|blue|green|purple|orange)/i);
    
    const x = positionMatch ? parseInt(positionMatch[1]) : 300;
    const y = positionMatch ? parseInt(positionMatch[2]) : 100;
    const size = sizeMatch ? parseInt(sizeMatch[1]) : 80;
    const color = colorMatch ? this.getColorRGB(colorMatch[1].toLowerCase()) : this.getColorRGB('red');
    
    // Create badge circle with glow effect
    commands.push({
      type: 'create',
      shape: 'ellipse',
      properties: {
        x, y, width: size, height: size,
        fills: [{ type: 'SOLID', color }],
        effects: [{
          type: 'INNER_SHADOW',
          color: { r: 0, g: 0, b: 0, a: 0.25 },
          offset: { x: 0, y: 1 },
          radius: 2,
          visible: true
        }, {
          type: 'DROP_SHADOW',
          color: Object.assign({}, color, { a: 0.3 }),
          offset: { x: 0, y: 0 },
          radius: 8,
          visible: true
        }]
      }
    });
    
    // Add notification count
    commands.push({
      type: 'create',
      shape: 'text',
      properties: {
        x: x + size/2 - 6,
        y: y + size/2 - 8,
        text: '5',
        fontSize: 14,
        fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }],
        fontName: { family: 'Inter', style: 'Bold' }
      }
    });
    
    return commands;
  }
  
  static createHeading(instruction) {
    const commands = [];
    const positionMatch = instruction.match(/positioned at (\d+),(\d+)/);
    const sizeMatch = instruction.match(/(\d+)px font size/);
    const textMatch = instruction.match(/saying "([^"]+)"/);
    
    const x = positionMatch ? parseInt(positionMatch[1]) : 500;
    const y = positionMatch ? parseInt(positionMatch[2]) : 100;
    const fontSize = sizeMatch ? parseInt(sizeMatch[1]) : 28;
    const text = textMatch ? textMatch[1] : 'Heading Text';
    
    commands.push({
      type: 'create',
      shape: 'text',
      properties: {
        x, y,
        text,
        fontSize,
        fills: [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.2 } }],
        fontName: { family: 'Inter', style: 'Bold' }
      }
    });
    
    return commands;
  }
  
  static getColorRGB(colorName) {
    const colors = {
      red: { r: 1, g: 0.2, b: 0.2 },
      blue: { r: 0.2, g: 0.5, b: 1 },
      green: { r: 0.2, g: 0.8, b: 0.2 },
      yellow: { r: 1, g: 0.9, b: 0.2 },
      black: { r: 0, g: 0, b: 0 },
      white: { r: 1, g: 1, b: 1 },
      gray: { r: 0.5, g: 0.5, b: 0.5 },
      purple: { r: 0.6, g: 0.2, b: 0.8 },
      orange: { r: 1, g: 0.6, b: 0.2 }
    };
    return colors[colorName] || colors.gray;
  }
}

// API Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get pending design commands (polled by Figma plugin)
app.get('/design-commands', (req, res) => {
  const commands = [...designCommandQueue];
  designCommandQueue = []; // Clear queue
  res.json(commands);
});

// Receive design responses from Figma plugin
app.post('/design-response', (req, res) => {
  const response = req.body;
  responseQueue.push({
    ...response,
    timestamp: new Date().toISOString()
  });
  console.log('Design response received:', response);
  res.json({ received: true });
});

// Claude MCP endpoint - receive natural language design instructions
app.post('/claude-design', (req, res) => {
  try {
    const { instruction, context } = req.body;
    
    console.log('Claude design instruction:', instruction);
    
    // Parse natural language into design commands
    const commands = DesignCommandParser.parseNaturalLanguage(instruction);
    
    // Add commands to queue
    designCommandQueue.push(...commands);
    
    res.json({
      success: true,
      commandsGenerated: commands.length,
      commands: commands,
      message: `Generated ${commands.length} design command(s) from instruction`
    });
    
  } catch (error) {
    console.error('Error processing Claude design instruction:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get recent responses (for Claude to check execution results)
app.get('/design-responses', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const recentResponses = responseQueue.slice(-limit);
  res.json(recentResponses);
});

// Test endpoint for manual command injection
app.post('/test-command', (req, res) => {
  const command = req.body;
  designCommandQueue.push(command);
  res.json({ success: true, message: 'Test command added to queue' });
});

// Claude natural language processing examples
app.get('/examples', (req, res) => {
  res.json({
    examples: [
      "Create a large blue circle at position 200,150",
      "Make a red rectangle size 300x200 at 50,50", 
      "Add text saying 'Hello World' at position 100,300",
      "Create a green square with radius 25 at 400,100",
      "Make a purple frame size 500x400 at center",
      "Create a large drivechain icon at the bottom of the page"
    ],
    supportedShapes: ['rectangle', 'circle', 'ellipse', 'text', 'frame'],
    supportedColors: ['red', 'blue', 'green', 'yellow', 'black', 'white', 'gray', 'purple', 'orange'],
    supportedProperties: ['position', 'size', 'width', 'height', 'radius', 'color', 'text'],
    specialFeatures: ['drivechain icon', 'blockchain elements', 'large/small sizes', 'bottom positioning']
  });
});

// Create drivechain icon endpoint (for direct API calls)
app.post('/create-drivechain-icon', (req, res) => {
  const { large = true, position = 'bottom' } = req.body;
  
  const commands = DesignCommandParser.createDrivechainIcon(
    `Create a ${large ? 'large' : 'normal'} drivechain icon at the ${position} of the page`
  );
  
  designCommandQueue.push(...commands);
  
  res.json({
    success: true,
    message: `Drivechain icon queued for creation`,
    commandsGenerated: commands.length,
    commands
  });
});

// Start server
app.listen(port, () => {
  console.log(`🎨 Claude-Figma Design Bridge MCP Server running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
  console.log(`Claude endpoint: POST http://localhost:${port}/claude-design`);
  console.log(`Drivechain icon: POST http://localhost:${port}/create-drivechain-icon`);
  console.log(`Examples: http://localhost:${port}/examples`);
});