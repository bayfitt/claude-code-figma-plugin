# Figma Desktop App Plugin Setup Guide

## 🎯 Issue Resolution: Desktop API Integration

**Problem**: Plugin needs to run in Figma Desktop App, not web browser  
**Solution**: Install plugin directly in desktop environment

## 📥 Desktop App Plugin Installation

### Step 1: Open Figma Desktop App
- Launch `/Applications/Figma.app` (confirmed running ✅)
- Login to your Figma account if needed

### Step 2: Access Plugin Development Menu
1. In Figma Desktop App, go to **Plugins** menu
2. Select **Development** → **Import plugin from manifest...**
3. Navigate to: `/Users/mami/projects/claude-code-figma-plugin/manifest.json`
4. Click **Open** to install

### Step 3: Verify Plugin Installation
- Plugin should appear in `Plugins` → `Development` → `Claude Code Design Bridge`
- Icon should show up in plugins list
- Plugin ready for testing with real designs

## 🎨 Create Test Designs in Desktop App

### Design 1: Primary Button
```
1. Press 'R' for rectangle tool
2. Draw rectangle: 120px × 40px  
3. Fill: #007AFF (blue)
4. Corner radius: 6px
5. Add text: Press 'T', type "Get Started"
6. Text color: white, Inter font, 14px
7. Name layer: "Primary Button"
```

### Design 2: Card Component  
```
1. Press 'F' for frame tool
2. Create frame: 280px × 200px
3. Fill: white (#FFFFFF)
4. Border: 1px, #E1E1E1
5. Corner radius: 8px
6. Add auto layout: vertical, 16px padding
7. Add elements:
   - Rectangle (60×60, #F0F0F0) - image placeholder
   - Text "Product Name" (16px, semibold)
   - Text "$29.99" (14px, #007AFF)
8. Name: "Product Card"
```

### Design 3: Input Field
```
1. Rectangle: 280px × 44px
2. Fill: white
3. Border: 1px, #D1D1D6  
4. Corner radius: 8px
5. Placeholder text: "Enter your email"
6. Name: "Email Input"
```

## 🔧 Test Plugin Workflow

### With Real Designs:
1. **Select** your created button/card/input
2. **Run Plugin**: Plugins → Claude Code Design Bridge  
3. **Extract Design**: Click "Extract Design Specifications"
4. **Generate Code**: Choose React + Tailwind, click "Generate Code"
5. **View Results**: See actual TypeScript component code

### Expected Plugin UI Features:
- **Extract Tab**: Design analysis and component extraction
- **Generate Tab**: Framework selection and code generation  
- **Create Tab**: AI-powered component creation from prompts
- **Settings Tab**: MCP server connection and configuration

## 🚀 Advanced Testing

### Test Real-time Modifications:
1. Select design element
2. Plugin should suggest improvements
3. Apply modifications to see Figma elements change
4. Test bidirectional sync with Claude Code

### Test AI Creation:
1. Go to Create tab in plugin
2. Enter: "Create a login form with email and password fields"
3. Click "Create from Prompt"
4. New components should appear in Figma

## 📊 Success Indicators

**✅ Plugin Working**:
- Green connection dot in plugin UI
- Successfully extracts component properties
- Generates clean TypeScript React code
- MCP server receives all messages
- Design modifications apply to Figma elements

**❌ Troubleshoot If**:
- Plugin doesn't appear → Restart Figma, re-import manifest
- Red connection dot → Check MCP server running on localhost:3001
- No code generated → Verify components are selected and extracted first
- Modifications don't apply → Check component selection and plugin permissions

## 🔗 Integration Status

- **MCP Server**: ✅ Running on localhost:3001
- **Plugin Build**: ✅ Compiled successfully
- **Desktop App**: ✅ Running and ready
- **Next Step**: Import plugin manifest and test with real designs

Ready to transform your designs into production code! 🎨→💻