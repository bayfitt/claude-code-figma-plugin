# Figma Plugin Test Setup Guide

## 🚀 Quick Setup Steps

### 1. Figma Account & App
1. **Download Figma Desktop**: https://www.figma.com/downloads/
2. **Login/Signup**: Create account at figma.com
3. **Launch Desktop App**: Required for plugin development

### 2. Create Test File
1. **New File**: Click "+" → "Design File"
2. **Name**: "Claude Code Plugin Test"
3. **Add Test Elements** (see designs below)

### 3. Install Plugin
1. **Plugins Menu**: `Plugins` → `Development` → `Import plugin from manifest...`
2. **Select Manifest**: Navigate to this project's `manifest.json`
3. **Confirm**: Plugin appears in plugins list

### 4. Test Workflow
1. **Select Elements**: Click on buttons, cards, text
2. **Run Plugin**: `Plugins` → `Claude Code Design Bridge`
3. **Extract Designs**: Click "Extract Design Specifications"
4. **Generate Code**: Switch to Generate tab, click "Generate Code"

## 🎨 Test Design Elements to Create

### Element 1: Primary Button
```
Type: Rectangle
Size: 120px × 40px
Fill: #007AFF (blue)
Border Radius: 6px
Text: "Get Started" (white, Inter, 14px, medium weight)
```

### Element 2: Product Card
```
Type: Frame (Auto Layout)
Size: 280px × 200px
Fill: #FFFFFF (white)
Border: 1px #E1E1E1
Padding: 16px all sides
Shadow: 0px 2px 8px rgba(0,0,0,0.1)

Contents:
- Image placeholder (60px × 60px, #F0F0F0)
- Title text ("Product Name", Inter, 16px, semibold)
- Price text ("$29.99", Inter, 14px, medium, #007AFF)
```

### Element 3: Text Input Field
```
Type: Rectangle
Size: 280px × 44px
Fill: #FFFFFF
Border: 1px #D1D1D6
Border Radius: 8px
Placeholder: "Enter your email" (gray text, Inter, 14px)
```

### Element 4: Navigation Header
```
Type: Frame (Auto Layout)
Size: 375px × 64px
Fill: #F8F8F8
Padding: 16px horizontal, 12px vertical

Contents:
- Logo (text "App", Inter, 18px, bold)
- Menu icon (24px × 24px, right aligned)
```

## 🔧 Plugin Testing Checklist

### Connection Test
- [ ] Plugin appears in Figma plugins menu
- [ ] Plugin UI loads without errors
- [ ] MCP server connection established (green dot in plugin)

### Design Extraction Test
- [ ] Select button → Extract → See component specs
- [ ] Select card → Extract → See layout properties
- [ ] Select text → Extract → See typography info
- [ ] Multiple selection → Extract → See all components

### Code Generation Test
- [ ] Choose React framework
- [ ] Choose Tailwind CSS
- [ ] Generate code → See TypeScript component
- [ ] Copy code → Verify clipboard content

### AI Features Test
- [ ] Create from Prompt: "Create a signup form"
- [ ] Suggest Improvements: Select button → Get suggestions
- [ ] Check Accessibility: Select elements → Get a11y report

## 🐛 Troubleshooting Common Issues

### Plugin Won't Load
**Symptoms**: Plugin not in menu or throws errors
**Solutions**:
1. Check manifest.json path is correct
2. Ensure all files in dist/ folder present
3. Restart Figma desktop app
4. Check browser console for errors (Cmd+Option+I)

### MCP Connection Failed
**Symptoms**: Red dot in plugin, "Disconnected" status
**Solutions**:
1. Verify MCP server running: `node test-mcp-server.js`
2. Check localhost:3001/status endpoint
3. Firewall/antivirus blocking localhost connections
4. Try different port in server config

### Design Extraction Empty
**Symptoms**: Extract button does nothing or returns empty
**Solutions**:
1. Ensure elements are selected in Figma
2. Check selected elements are supported types (not slices/groups)
3. Verify plugin has read permissions
4. Check browser console for JavaScript errors

### Code Generation Fails
**Symptoms**: Generate button works but returns errors
**Solutions**:
1. First extract design specs successfully
2. Verify MCP server responding to /mcp-bridge/message
3. Check extracted specs contain valid component data
4. Try simpler components first (single button vs complex layouts)

## 📱 Mobile Testing (Optional)
For mobile UI testing:
1. Set Figma frame to iPhone/Android size (375×812)
2. Create mobile-specific components
3. Test responsive design extraction
4. Verify mobile-first code generation

## 🎯 Success Criteria
- ✅ Plugin loads in Figma without errors
- ✅ Can select and extract at least 3 different component types
- ✅ Generated code compiles and renders correctly
- ✅ MCP bridge maintains stable connection
- ✅ All plugin tabs and features functional

Ready to test! Create the design elements above, then run through the testing checklist.