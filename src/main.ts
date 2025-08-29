// Claude Code Figma Plugin - Main Thread
import { ComponentExtractor } from './extractors/component-extractor';
import { MCPBridge } from './mcp/bridge';
import { ComponentSpec, PluginState } from './types';

// Initialize MCP Bridge
const mcpBridge = new MCPBridge();

// Plugin state
let pluginState: PluginState = {
  connected: false,
  selectedNodes: [],
  extractedSpecs: [],
  generatedCode: '',
  framework: 'react',
  designSystem: 'shadcn',
  isLoading: false,
};

// Show plugin UI
figma.showUI(__html__, { 
  width: 400, 
  height: 600,
  themeColors: true 
});

// Initialize plugin
async function initializePlugin() {
  try {
    const connectionStatus = await mcpBridge.establishConnection();
    pluginState.connected = connectionStatus.success;
    
    // Send initial state to UI
    figma.ui.postMessage({
      type: 'state-update',
      state: pluginState
    });

    console.log('Claude Code Plugin initialized:', connectionStatus);
  } catch (error) {
    console.error('Failed to initialize plugin:', error);
    pluginState.error = 'Failed to connect to Claude Code';
    figma.ui.postMessage({
      type: 'state-update', 
      state: pluginState
    });
  }
}

// Handle selection changes
figma.on('selectionchange', () => {
  pluginState.selectedNodes = figma.currentPage.selection.slice();
  
  figma.ui.postMessage({
    type: 'selection-changed',
    selection: pluginState.selectedNodes.map(node => ({
      id: node.id,
      name: node.name,
      type: node.type,
    }))
  });
});

// Handle messages from UI
figma.ui.onmessage = async (msg) => {
  try {
    switch (msg.type) {
      case 'extract-design':
        await handleExtractDesign(msg);
        break;
      
      case 'generate-code':
        await handleGenerateCode(msg);
        break;
        
      case 'apply-modifications':
        await handleApplyModifications(msg);
        break;
        
      case 'sync-design-tokens':
        await handleSyncDesignTokens(msg);
        break;
        
      case 'create-component':
        await handleCreateComponent(msg);
        break;
        
      case 'design-command':
        await handleDesignCommand(msg);
        break;
        
      case 'test-connection':
        await testMCPConnection();
        break;
        
      case 'update-settings':
        handleUpdateSettings(msg);
        break;
        
      case 'close-plugin':
        figma.closePlugin();
        break;
        
      default:
        console.warn('Unknown message type:', msg.type);
    }
  } catch (error) {
    console.error('Error handling message:', error);
    pluginState.error = error instanceof Error ? error.message : String(error);
    updateUI();
  }
};

/**
 * Extract design specifications from selected nodes
 */
async function handleExtractDesign(msg: any) {
  pluginState.isLoading = true;
  updateUI();
  
  try {
    const selectedNodes = msg.nodeIds 
      ? msg.nodeIds.map((id: string) => figma.getNodeById(id)).filter(Boolean) as SceneNode[]
      : pluginState.selectedNodes;
    
    if (selectedNodes.length === 0) {
      throw new Error('No nodes selected');
    }

    // Extract component specs from selected nodes
    const extractedSpecs: ComponentSpec[] = [];
    
    for (const node of selectedNodes) {
      const spec = ComponentExtractor.extractComponent(node);
      extractedSpecs.push(spec);
    }
    
    pluginState.extractedSpecs = extractedSpecs;
    
    // Send to Claude Code via MCP
    if (pluginState.connected) {
      const response = await mcpBridge.sendToClaudeCode({
        action: 'design-extracted',
        components: extractedSpecs,
        timestamp: Date.now(),
      });
      
      console.log('Design sent to Claude Code:', response);
    }
    
    // Send to UI
    figma.ui.postMessage({
      type: 'design-extracted',
      specs: extractedSpecs,
    });
    
  } finally {
    pluginState.isLoading = false;
    updateUI();
  }
}

/**
 * Generate code from design specifications
 */
async function handleGenerateCode(msg: any) {
  pluginState.isLoading = true;
  updateUI();
  
  try {
    if (!pluginState.connected) {
      throw new Error('Not connected to Claude Code');
    }
    
    const codeGenRequest = {
      action: 'generate-code',
      designSpec: {
        framework: msg.framework || pluginState.framework,
        designSystem: msg.designSystem || pluginState.designSystem,
        components: pluginState.extractedSpecs,
      },
      options: {
        includeTests: msg.includeTests || false,
        includeStorybook: msg.includeStorybook || false,
        outputDir: msg.outputDir,
      },
    };
    
    const response = await mcpBridge.sendToClaudeCode(codeGenRequest);
    
    if (response.success) {
      pluginState.generatedCode = response.data.code;
      
      figma.ui.postMessage({
        type: 'code-generated',
        code: response.data.code,
        files: response.data.files,
      });
    } else {
      throw new Error(response.error || 'Code generation failed');
    }
    
  } finally {
    pluginState.isLoading = false;
    updateUI();
  }
}

/**
 * Apply modifications to Figma design based on Claude Code suggestions
 */
async function handleApplyModifications(msg: any) {
  pluginState.isLoading = true;
  updateUI();
  
  try {
    const modifications = msg.modifications;
    
    for (const mod of modifications) {
      const node = figma.getNodeById(mod.nodeId) as SceneNode;
      if (node) {
        await applyModificationToNode(node, mod.changes);
      }
    }
    
    figma.ui.postMessage({
      type: 'modifications-applied',
      success: true,
    });
    
  } finally {
    pluginState.isLoading = false;
    updateUI();
  }
}

/**
 * Sync design tokens between Figma and Claude Code
 */
async function handleSyncDesignTokens(msg: any) {
  pluginState.isLoading = true;
  updateUI();
  
  try {
    // Extract design tokens from Figma
    const tokens = await extractDesignTokens();
    
    // Send to Claude Code
    const response = await mcpBridge.sendToClaudeCode({
      action: 'sync-tokens',
      tokens,
    });
    
    figma.ui.postMessage({
      type: 'tokens-synced',
      tokens,
      response,
    });
    
  } finally {
    pluginState.isLoading = false;
    updateUI();
  }
}

/**
 * Create new component in Figma from Claude Code specification
 */
async function handleCreateComponent(msg: any) {
  pluginState.isLoading = true;
  updateUI();
  
  try {
    const componentSpec = msg.componentSpec;
    const createdNode = await createComponentFromSpec(componentSpec);
    
    figma.ui.postMessage({
      type: 'component-created',
      nodeId: createdNode.id,
      success: true,
    });
    
  } finally {
    pluginState.isLoading = false;
    updateUI();
  }
}

/**
 * Update plugin settings
 */
function handleUpdateSettings(msg: any) {
  if (msg.framework) {
    pluginState.framework = msg.framework;
  }
  if (msg.designSystem) {
    pluginState.designSystem = msg.designSystem;
  }
  
  updateUI();
}

/**
 * Helper function to update UI with current state
 */
function updateUI() {
  figma.ui.postMessage({
    type: 'state-update',
    state: pluginState,
  });
}

/**
 * Apply a modification to a Figma node
 */
async function applyModificationToNode(node: SceneNode, changes: Partial<ComponentSpec>) {
  // Apply color changes
  if (changes.properties && changes.properties.colors && changes.properties.colors.background && 'fills' in node) {
    const color = hexToRgba(changes.properties.colors.background);
    node.fills = [{ type: 'SOLID', color }];
  }
  
  // Apply dimension changes
  if (changes.properties && changes.properties.dimensions && 'resize' in node) {
    const { width, height } = changes.properties.dimensions;
    node.resize(width, height);
  }
  
  // Apply spacing changes (for auto layout)
  if (changes.properties && changes.properties.spacing && changes.properties.spacing.padding && 'paddingTop' in node) {
    const padding = changes.properties.spacing.padding;
    node.paddingTop = padding.top;
    node.paddingRight = padding.right;
    node.paddingBottom = padding.bottom;
    node.paddingLeft = padding.left;
  }
  
  // Add more modification types as needed
}

/**
 * Extract design tokens from current Figma file
 */
async function extractDesignTokens() {
  const tokens = {
    colors: {},
    typography: {},
    spacing: {},
    shadows: {},
  };
  
  // Extract color styles
  const colorStyles = figma.getLocalPaintStyles();
  colorStyles.forEach(style => {
    if (style.paints.length > 0 && style.paints[0].type === 'SOLID') {
      const paint = style.paints[0];
      (tokens.colors as any)[style.name] = rgbaToHex(paint.color, paint.opacity || 1);
    }
  });
  
  // Extract text styles
  const textStyles = figma.getLocalTextStyles();
  textStyles.forEach(style => {
    (tokens.typography as any)[style.name] = {
      fontFamily: typeof style.fontName === 'object' ? style.fontName.family : 'Arial',
      fontSize: style.fontSize,
      fontWeight: getFontWeight(typeof style.fontName === 'object' ? style.fontName.style : 'Regular'),
      lineHeight: typeof style.lineHeight === 'object' && 'value' in style.lineHeight ? style.lineHeight.value : 1.2,
    };
  });
  
  return tokens;
}

/**
 * Create a Figma component from a specification
 */
async function createComponentFromSpec(spec: ComponentSpec): Promise<SceneNode> {
  // Create appropriate node based on component type
  let node: SceneNode;
  
  switch (spec.type) {
    case 'button':
      node = figma.createFrame();
      break;
    case 'text':
      node = figma.createText();
      break;
    case 'container':
      node = figma.createFrame();
      break;
    default:
      node = figma.createFrame();
  }
  
  // Apply properties
  node.name = spec.name;
  
  if ('resize' in node) {
    node.resize(spec.properties.dimensions.width, spec.properties.dimensions.height);
  }
  
  // Apply colors
  if (spec.properties.colors.background && 'fills' in node) {
    const color = hexToRgba(spec.properties.colors.background);
    node.fills = [{ type: 'SOLID', color }];
  }
  
  // Add to current page
  figma.currentPage.appendChild(node);
  
  return node;
}

// Helper functions
function hexToRgba(hex: string): RGB {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return { r, g, b };
}

function rgbaToHex(color: RGB | RGBA, opacity = 1): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function getFontWeight(style: string): number {
  const weightMap: Record<string, number> = {
    'Thin': 100, 'Extra Light': 200, 'Light': 300, 'Regular': 400,
    'Medium': 500, 'Semi Bold': 600, 'Bold': 700, 'Extra Bold': 800, 'Black': 900,
  };
  return weightMap[style] || 400;
}

/**
 * Handle design commands from Claude/MCP server
 */
async function handleDesignCommand(msg: any) {
  pluginState.isLoading = true;
  updateUI();
  
  try {
    const command = msg.command;
    let createdNode: SceneNode | null = null;
    
    switch (command.type) {
      case 'create':
        createdNode = await createNodeFromCommand(command);
        break;
      case 'modify':
        await modifyNodeFromCommand(command);
        break;
      case 'delete':
        await deleteNodeFromCommand(command.target);
        break;
    }
    
    // Send success response
    figma.ui.postMessage({
      type: 'command-executed',
      command,
      nodeId: createdNode ? createdNode.id : undefined,
      success: true
    });
    
    // Send to MCP server if connected
    if (pluginState.connected) {
      await mcpBridge.sendToClaudeCode({
        action: 'design-response',
        success: true,
        nodeId: createdNode ? createdNode.id : undefined,
        message: `Successfully ${command.type}d ${command.shape}`
      });
    }
    
  } catch (error) {
    console.error('Design command failed:', error);
    
    // Send error response
    figma.ui.postMessage({
      type: 'command-error', 
      error: error instanceof Error ? error.message : String(error)
    });
    
    if (pluginState.connected) {
      await mcpBridge.sendToClaudeCode({
        action: 'design-response',
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
    
  } finally {
    pluginState.isLoading = false;
    updateUI();
  }
}

/**
 * Create a new node from a design command
 */
async function createNodeFromCommand(command: any): Promise<SceneNode> {
  let node: SceneNode;
  const props = command.properties;
  
  // Create node based on shape type
  switch (command.shape) {
    case 'rectangle':
      node = figma.createRectangle();
      if (props.cornerRadius) {
        (node as RectangleNode).cornerRadius = props.cornerRadius;
      }
      break;
      
    case 'ellipse':
      node = figma.createEllipse();
      break;
      
    case 'text':
      node = figma.createText();
      // Load default font
      await figma.loadFontAsync({ family: "Inter", style: "Regular" });
      (node as TextNode).characters = props.text || 'Sample Text';
      if (props.fontSize) {
        (node as TextNode).fontSize = props.fontSize;
      }
      break;
      
    case 'frame':
      node = figma.createFrame();
      break;
      
    default:
      throw new Error(`Unsupported shape type: ${command.shape}`);
  }
  
  // Apply common properties
  applyPropertiesToNode(node, props);
  
  // Add to current page and select
  figma.currentPage.appendChild(node);
  figma.currentPage.selection = [node];
  figma.viewport.scrollAndZoomIntoView([node]);
  
  return node;
}

/**
 * Modify an existing node from a design command
 */
async function modifyNodeFromCommand(command: any): Promise<void> {
  if (!command.target) {
    throw new Error('Target node ID required for modification');
  }
  
  const node = figma.getNodeById(command.target);
  if (!node) {
    throw new Error(`Node with ID ${command.target} not found`);
  }
  
  applyPropertiesToNode(node as SceneNode, command.properties);
}

/**
 * Delete a node from a design command
 */
async function deleteNodeFromCommand(nodeId: string): Promise<void> {
  const node = figma.getNodeById(nodeId);
  if (!node) {
    throw new Error(`Node with ID ${nodeId} not found`);
  }
  
  node.remove();
}

/**
 * Apply properties to a Figma node
 */
function applyPropertiesToNode(node: SceneNode, props: any) {
  // Position and size
  if (props.x !== undefined) node.x = props.x;
  if (props.y !== undefined) node.y = props.y;
  if (props.width !== undefined && props.height !== undefined && 'resize' in node) {
    node.resize(props.width, props.height);
  }
  
  // Fills
  if (props.fills && 'fills' in node) {
    node.fills = props.fills;
  }
  
  // Strokes
  if (props.strokes && 'strokes' in node) {
    node.strokes = props.strokes;
  }
  
  if (props.strokeWeight && 'strokeWeight' in node) {
    node.strokeWeight = props.strokeWeight;
  }
  
  // Corner radius for rectangles
  if (props.cornerRadius && node.type === 'RECTANGLE') {
    (node as RectangleNode).cornerRadius = props.cornerRadius;
  }
  
  // Effects (shadows, etc.)
  if (props.effects && 'effects' in node) {
    try {
      node.effects = props.effects;
    } catch (error) {
      console.warn('Could not apply effects:', error);
    }
  }
  
  // Text properties
  if (node.type === 'TEXT') {
    const textNode = node as TextNode;
    if (props.text) textNode.characters = props.text;
    if (props.fontSize) textNode.fontSize = props.fontSize;
    if (props.fontName) {
      figma.loadFontAsync(props.fontName).then(() => {
        textNode.fontName = props.fontName;
      }).catch(() => {
        // Fallback to default font if specified font fails
        figma.loadFontAsync({ family: "Inter", style: "Regular" }).then(() => {
          textNode.fontName = { family: "Inter", style: "Regular" };
        });
      });
    }
  }
}

/**
 * Test MCP connection
 */
async function testMCPConnection(): Promise<void> {
  try {
    const response = await fetch('http://localhost:3001/health');
    const status = response.ok ? 'connected' : 'error';
    
    figma.ui.postMessage({
      type: 'connection-status',
      status,
      message: response.ok ? 'MCP Server Connected' : 'MCP Server Error'
    });
  } catch (error) {
    figma.ui.postMessage({
      type: 'connection-status',
      status: 'error',
      message: `Connection failed: ${error instanceof Error ? error.message : String(error)}`
    });
  }
}

// Start MCP listener for external commands
let mcpPollingInterval: number;

async function startMCPListener() {
  const poll = async () => {
    try {
      const response = await fetch('http://localhost:3001/design-commands');
      if (response.ok) {
        const commands = await response.json();
        
        for (const command of commands) {
          await handleDesignCommand({ command });
        }
      }
    } catch (error) {
      console.log('MCP polling error:', error);
    }
  };
  
  // Poll every second
  mcpPollingInterval = setInterval(poll, 1000) as unknown as number;
}

// Initialize the plugin
initializePlugin();

// Start MCP listener for external commands
startMCPListener();