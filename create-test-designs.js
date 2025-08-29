// Automated Figma Test Design Creator
// This script creates test designs programmatically via Figma API

const testDesigns = {
  "primaryButton": {
    type: "RECTANGLE",
    name: "Primary Button",
    width: 120,
    height: 40,
    fills: [{ type: "SOLID", color: { r: 0, g: 0.478, b: 1 } }], // #007AFF
    cornerRadius: 6,
    children: [{
      type: "TEXT",
      name: "Button Text",
      characters: "Get Started",
      fills: [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }], // white
      fontName: { family: "Inter", style: "Medium" },
      fontSize: 14
    }]
  },

  "productCard": {
    type: "FRAME",
    name: "Product Card",
    width: 280,
    height: 200,
    fills: [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }], // white
    strokes: [{ type: "SOLID", color: { r: 0.882, g: 0.882, b: 0.882 } }], // #E1E1E1
    strokeWeight: 1,
    cornerRadius: 8,
    paddingTop: 16,
    paddingRight: 16,
    paddingBottom: 16,
    paddingLeft: 16,
    layoutMode: "VERTICAL",
    itemSpacing: 12,
    effects: [{
      type: "DROP_SHADOW",
      color: { r: 0, g: 0, b: 0, a: 0.1 },
      offset: { x: 0, y: 2 },
      radius: 8,
      spread: 0
    }],
    children: [
      {
        type: "RECTANGLE",
        name: "Product Image",
        width: 60,
        height: 60,
        fills: [{ type: "SOLID", color: { r: 0.941, g: 0.941, b: 0.941 } }], // #F0F0F0
        cornerRadius: 4
      },
      {
        type: "TEXT",
        name: "Product Title",
        characters: "Product Name",
        fills: [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }],
        fontName: { family: "Inter", style: "SemiBold" },
        fontSize: 16
      },
      {
        type: "TEXT", 
        name: "Product Price",
        characters: "$29.99",
        fills: [{ type: "SOLID", color: { r: 0, g: 0.478, b: 1 } }], // #007AFF
        fontName: { family: "Inter", style: "Medium" },
        fontSize: 14
      }
    ]
  },

  "textInput": {
    type: "RECTANGLE",
    name: "Email Input",
    width: 280,
    height: 44,
    fills: [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }],
    strokes: [{ type: "SOLID", color: { r: 0.82, g: 0.82, b: 0.84 } }], // #D1D1D6
    strokeWeight: 1,
    cornerRadius: 8,
    children: [{
      type: "TEXT",
      name: "Placeholder",
      characters: "Enter your email",
      fills: [{ type: "SOLID", color: { r: 0.557, g: 0.557, b: 0.576 } }], // gray
      fontName: { family: "Inter", style: "Regular" },
      fontSize: 14
    }]
  },

  "navigationHeader": {
    type: "FRAME",
    name: "Navigation Header",
    width: 375,
    height: 64,
    fills: [{ type: "SOLID", color: { r: 0.973, g: 0.973, b: 0.973 } }], // #F8F8F8
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 12,
    paddingBottom: 12,
    layoutMode: "HORIZONTAL",
    primaryAxisAlignItems: "SPACE_BETWEEN",
    counterAxisAlignItems: "CENTER",
    children: [
      {
        type: "TEXT",
        name: "App Logo",
        characters: "App",
        fills: [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }],
        fontName: { family: "Inter", style: "Bold" },
        fontSize: 18
      },
      {
        type: "RECTANGLE",
        name: "Menu Icon",
        width: 24,
        height: 24,
        fills: [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.2 } }],
        cornerRadius: 2
      }
    ]
  }
};

console.log("📐 Test Design Specifications:");
console.log("Use these specs to manually create components in Figma:");
console.log(JSON.stringify(testDesigns, null, 2));

console.log("\n🎨 Manual Creation Guide:");
console.log("1. Open Figma Desktop App");
console.log("2. Create new design file: 'Claude Code Plugin Test'");
console.log("3. Create each component using the specifications above");
console.log("4. Use exact colors, fonts, and dimensions specified");
console.log("5. Test plugin on each created component");

module.exports = testDesigns;