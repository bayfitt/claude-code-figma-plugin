# AI Interops Troubleshooting Request - Claude Sonnet 4

## Problem Statement
**Objective**: Create a Figma plugin that allows Claude to programmatically CREATE and MODIFY designs in Figma (not just read/extract), enabling bidirectional design-code workflow.

**Current Issue**: Existing plugin only extracts designs → generates code. Need reverse capability: Claude instructions → create/modify Figma designs directly.

## Technical Context

### Current Implementation
- **Plugin Type**: UI + Main thread plugin
- **Capabilities**: 
  ✅ Read Figma selections
  ✅ Extract design specifications  
  ✅ Generate code from designs
  ❌ Create new shapes/components in Figma
  ❌ Modify existing designs programmatically

### Desired Functionality
- Claude sends design instructions via MCP bridge
- Plugin creates/modifies Figma nodes programmatically
- Real-time bidirectional sync between Claude Code and Figma canvas

## Figma API Constraints Analysis

### Current Understanding
- **Sandbox Environment**: Figma plugins run in restricted sandbox
- **Node Creation**: Should be possible via `figma.createRectangle()`, `figma.createEllipse()`, etc.
- **Property Modification**: Should support fills, strokes, positioning, etc.
- **Selection Management**: Can modify `figma.currentPage.selection`

### Development Plugin Requirements
- **Development Mode**: Using Figma Desktop App with manifest.json
- **Network Access**: Already configured for `http://localhost:3001`
- **Permissions**: May need additional permissions for node creation?

## Specific Questions for Claude Sonnet 4

### 1. Figma Plugin Architecture
```typescript
// Is this the correct approach for programmatic node creation?
const rect = figma.createRectangle();
rect.fills = [{type: 'SOLID', color: {r: 1, g: 0, b: 0}}];
rect.resize(100, 100);
figma.currentPage.appendChild(rect);
```

### 2. Plugin Manifest Configuration
```json
{
  "name": "Claude Code Design Bridge",
  "id": "claude-code-figma-bridge", 
  "api": "1.0.0",
  "main": "dist/main.js",
  "ui": "dist/ui.html",
  "documentAccess": "dynamic-page",
  // Do we need additional permissions for node creation?
  "permissions": ["currentuser", "activeusers", "write"]
}
```

### 3. MCP Bridge Integration
- How to receive design commands from Claude via HTTP/WebSocket?
- Best practices for parsing natural language → Figma API calls?
- Error handling for invalid design requests?

### 4. Node Creation Patterns
```typescript
// Example desired workflow:
// Claude: "Create a large blue circle at position 100,100"
// Plugin should execute:
const circle = figma.createEllipse();
circle.fills = [{type: 'SOLID', color: {r: 0, g: 0, b: 1}}];
circle.resize(200, 200);
circle.x = 100;
circle.y = 100;
figma.currentPage.appendChild(circle);
```

## Development Environment
- **OS**: macOS Darwin 24.1.0
- **Figma**: Desktop App (latest)
- **Development**: TypeScript, Webpack, Node.js
- **MCP Server**: Express.js running on localhost:3001

## Expected Deliverables
1. **Working Plugin Code**: Complete TypeScript implementation
2. **MCP Integration**: HTTP endpoints for receiving Claude design commands
3. **Design Command Parser**: Natural language → Figma API translator
4. **Error Handling**: Robust validation and user feedback
5. **Testing Interface**: Validate Claude → Figma design creation

## Success Criteria
- [ ] Claude can create basic shapes (rectangles, circles, text) in Figma
- [ ] Support for styling (colors, gradients, borders, shadows)
- [ ] Positioning and sizing control
- [ ] Component creation and instancing
- [ ] Real-time feedback to Claude about creation success/failure

## Priority Level
**HIGH** - This is blocking the bidirectional design-code workflow that's core to the Claude Code development powerhouse implementation.

## Previous Attempts
- Basic extraction plugin working ✅
- MCP server communication established ✅  
- Figma API documentation reviewed ✅
- Need guidance on programmatic node creation patterns ❌

---

**Request for Claude Sonnet 4**: Please provide detailed implementation guidance, code examples, and architectural recommendations for enabling Claude to create designs programmatically in Figma via plugin API.