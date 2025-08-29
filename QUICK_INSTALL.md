# 🚀 Quick Installation Guide - Claude Figma Design Bridge

## ✅ System Ready!

Your bidirectional Claude-to-Figma design creation system is built and ready to install.

## 📦 Installation Steps

### 1. Install in Figma Desktop App

1. **Open Figma Desktop App** (not web version)
2. **Go to**: Plugins → Development → Import plugin from manifest...  
3. **Select**: `/Users/mami/projects/claude-code-figma-plugin/manifest.json`
4. **Click**: Open

### 2. Start the MCP Server (if not running)

```bash
cd /Users/mami/projects/claude-code-figma-plugin
node mcp-design-server.js
```

**Server running on**: http://localhost:3001

### 3. Test the Plugin

1. **Open your drivechain icons Figma file**
2. **Run the plugin**: Plugins → Development → Claude Code Design Bridge
3. **Try these options**:

#### Option A: Quick Create
- Click "🔗 Create Drivechain Icon" button

#### Option B: Natural Language
- Type: "create a large drivechain icon at the bottom"
- Click "🚀 Execute Design"

## 🎨 What Gets Created

Your drivechain icon will have:
- **Large size**: 200×200 pixels
- **Position**: Bottom of the page (y: 500)
- **Components**: 6 design elements
  - Dark navy background circle with purple glow
  - Orange central blockchain block  
  - 4 purple chain links around the icon
  - Professional blockchain aesthetic

## 🔧 Troubleshooting

### Plugin Won't Load
- Make sure you're using **Figma Desktop App**, not web version
- Check that `manifest.json` has no syntax errors
- Verify the `dist/` folder exists with built files

### Connection Issues  
- Ensure MCP server is running on port 3001
- Test: `curl http://localhost:3001/health`
- Check firewall/antivirus blocking localhost connections

### No Design Created
- Commands are queued automatically - they execute when plugin runs
- Check the Activity Log in the plugin UI for error messages
- Try the "Test MCP Connection" button in Settings tab

## 🚀 Success!

Once working, you can create any design using natural language:
- "make a blue button 150px wide"
- "create a red circle with white border"  
- "add text saying 'Hello World' in large font"

Your Claude Code development powerhouse now has **true design creation superpowers**! 🎯

## 📋 Commands Already Queued

The drivechain icon you requested is already in the command queue. When you run the plugin, it should create automatically!

---

**Need help?** Check the Activity Log in the plugin UI or review the server logs for detailed error information.