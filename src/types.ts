// Core types for Claude Code Figma Plugin

export interface ComponentSpec {
  id: string;
  name: string;
  type: 'button' | 'input' | 'card' | 'layout' | 'text' | 'image' | 'container' | 'custom';
  properties: {
    dimensions: { width: number; height: number; };
    colors: { 
      background?: string; 
      text?: string; 
      border?: string; 
    };
    typography: { 
      family: string; 
      size: number; 
      weight: number; 
      lineHeight?: number;
    };
    spacing: { 
      padding: SpacingObject; 
      margin: SpacingObject; 
    };
    effects: ShadowEffect[];
    opacity: number;
  };
  states: StateVariation[];
  interactions: InteractionEvent[];
  accessibility: A11yAttributes;
  children: ComponentSpec[];
}

export interface SpacingObject {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface StateVariation {
  name: string; // 'hover', 'active', 'disabled', etc.
  properties: Partial<ComponentSpec['properties']>;
}

export interface InteractionEvent {
  trigger: 'click' | 'hover' | 'focus' | 'input';
  action: string;
  target?: string;
}

export interface A11yAttributes {
  role?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  tabIndex?: number;
  focusable: boolean;
}

export interface ShadowEffect {
  type: 'drop-shadow' | 'inner-shadow';
  color: string;
  offset: { x: number; y: number; };
  blur: number;
  spread: number;
}

export interface DesignTokens {
  colors: Record<string, string>;
  typography: Record<string, TypographyToken>;
  spacing: Record<string, number>;
  borderRadius: Record<string, number>;
  shadows: Record<string, ShadowEffect>;
}

export interface TypographyToken {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing?: number;
}

export interface LayoutStructure {
  type: 'flex' | 'grid' | 'absolute' | 'flow';
  direction?: 'row' | 'column';
  gap?: number;
  alignment: {
    horizontal: 'left' | 'center' | 'right' | 'stretch';
    vertical: 'top' | 'center' | 'bottom' | 'stretch';
  };
  responsive: ResponsiveBreakpoint[];
}

export interface ResponsiveBreakpoint {
  minWidth: number;
  maxWidth?: number;
  properties: Partial<ComponentSpec['properties']>;
}

export interface CodeGenerationSpec {
  framework: 'react' | 'vue' | 'angular' | 'svelte' | 'html';
  designSystem?: 'tailwind' | 'chakra' | 'material' | 'antd' | 'shadcn';
  components: ComponentSpec[];
  tokens: DesignTokens;
  layout: LayoutStructure;
  assets: AssetReference[];
}

export interface AssetReference {
  id: string;
  type: 'image' | 'icon' | 'video';
  url: string;
  alt?: string;
  dimensions: { width: number; height: number; };
}

// MCP Communication Types
export interface MCPMessage {
  action: 'extract-design' | 'generate-code' | 'apply-modifications' | 'sync-tokens';
  payload: any;
  timestamp: number;
  sessionId: string;
}

export interface MCPResponse {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: number;
}

export interface DesignExtractRequest {
  nodeIds: string[];
  extractTokens: boolean;
  extractLayout: boolean;
  extractInteractions: boolean;
}

export interface CodeGenerationRequest {
  designSpec: CodeGenerationSpec;
  options: {
    framework: string;
    designSystem?: string;
    outputDir?: string;
    includeTests?: boolean;
    includeStorybook?: boolean;
  };
}

export interface DesignModification {
  nodeId: string;
  changes: Partial<ComponentSpec>;
  reason: string;
}

// Plugin UI State
export interface PluginState {
  connected: boolean;
  selectedNodes: SceneNode[];
  extractedSpecs: ComponentSpec[];
  generatedCode: string;
  framework: string;
  designSystem: string;
  isLoading: boolean;
  error?: string;
}