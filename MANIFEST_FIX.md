# ✅ Manifest URL Error Fixed!

## 🔧 Issue Resolution

**Error**: "localhost must be a valid url"  
**Cause**: Figma requires full URL format including protocol (http://)  
**Fix**: Updated manifest.json with proper URL formats

## 📁 Installation Options

### Option 1: Full Manifest (Recommended)
**File**: `manifest.json`
- Full network access configuration
- Development domains enabled
- All permissions included

### Option 2: Minimal Manifest (Fallback)  
**File**: `manifest-minimal.json`
- Simplified configuration
- Only essential localhost access
- Use if main manifest still has issues

## 🚀 Install in Figma Desktop App

1. **Open Figma Desktop App**
2. **Go to**: Plugins → Development → Import plugin from manifest...
3. **Select**: `manifest.json` (try this first)
4. **If error persists**: Try `manifest-minimal.json`
5. **Click**: Open

## ✅ Fixed Network Access Configuration

**Before** (Invalid):
```json
"allowedDomains": ["localhost:*", "127.0.0.1:*"]
```

**After** (Valid):
```json
"allowedDomains": [
  "http://localhost:*", 
  "https://localhost:*", 
  "http://127.0.0.1:*", 
  "https://127.0.0.1:*"
]
```

## 🎯 Test Installation Success

**Plugin should appear as**:
- Name: "Claude Code Design Bridge"
- Location: Plugins → Development → Claude Code Design Bridge

**Ready to test with real designs!** 🎨→💻

## 🔗 MCP Server Status
- ✅ Running on http://localhost:3001
- ✅ Ready to receive plugin connections
- ✅ Test interface available

**Try installing the plugin now!**