// MCP Communication Bridge for Claude Code Integration

import { MCPMessage, MCPResponse } from '../types';

export class MCPBridge {
  private baseUrl: string;
  private sessionId: string;
  private connected: boolean = false;
  private retryCount: number = 0;
  private maxRetries: number = 3;

  constructor(baseUrl: string = 'http://localhost:3001') {
    this.baseUrl = baseUrl;
    this.sessionId = this.generateSessionId();
  }

  /**
   * Establish connection with Claude Code MCP server
   */
  async establishConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.makeRequest('/mcp-bridge/connect', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: this.sessionId,
          pluginVersion: '1.0.0',
          timestamp: Date.now(),
        }),
      });

      if (response.success) {
        this.connected = true;
        this.retryCount = 0;
        console.log('Connected to Claude Code MCP server');
      }

      return response;
    } catch (error) {
      console.error('Failed to connect to MCP server:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  /**
   * Send data to Claude Code
   */
  async sendToClaudeCode(data: any): Promise<MCPResponse> {
    if (!this.connected) {
      const connectionResult = await this.establishConnection();
      if (!connectionResult.success) {
        throw new Error('Cannot connect to Claude Code MCP server');
      }
    }

    const message: MCPMessage = {
      action: data.action,
      payload: data,
      timestamp: Date.now(),
      sessionId: this.sessionId,
    };

    try {
      const response = await this.makeRequest('/mcp-bridge/message', {
        method: 'POST',
        body: JSON.stringify(message),
      });

      return response;
    } catch (error) {
      console.error('Failed to send message to Claude Code:', error);
      
      // Retry logic
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`Retrying... (${this.retryCount}/${this.maxRetries})`);
        await this.delay(1000 * this.retryCount);
        return this.sendToClaudeCode(data);
      }

      throw error;
    }
  }

  /**
   * Receive modifications from Claude Code
   */
  async receiveFromClaudeCode(): Promise<any> {
    if (!this.connected) {
      throw new Error('Not connected to Claude Code MCP server');
    }

    try {
      const response = await this.makeRequest(`/mcp-bridge/receive/${this.sessionId}`, {
        method: 'GET',
      });

      return response.data;
    } catch (error) {
      console.error('Failed to receive from Claude Code:', error);
      throw error;
    }
  }

  /**
   * Sync design changes bidirectionally
   */
  async syncDesignChanges(designData: any): Promise<any> {
    const syncMessage = {
      action: 'sync-design-changes',
      designData,
      direction: 'figma-to-claude',
    };

    const response = await this.sendToClaudeCode(syncMessage);
    
    if (response.success && response.data && response.data.modifications) {
      // Return modifications to apply to Figma
      return response.data.modifications;
    }

    return null;
  }

  /**
   * Start real-time sync with Claude Code
   */
  startRealtimeSync(): void {
    if (!this.connected) {
      console.warn('Cannot start realtime sync - not connected');
      return;
    }

    // Set up polling for changes from Claude Code
    setInterval(async () => {
      try {
        const changes = await this.receiveFromClaudeCode();
        if (changes && changes.length > 0) {
          // Emit event for main thread to handle changes
          figma.ui.postMessage({
            type: 'claude-code-changes',
            changes,
          });
        }
      } catch (error) {
        console.error('Realtime sync error:', error);
      }
    }, 2000); // Poll every 2 seconds
  }

  /**
   * Send design tokens to Claude Code
   */
  async syncDesignTokens(tokens: any): Promise<MCPResponse> {
    return this.sendToClaudeCode({
      action: 'sync-design-tokens',
      tokens,
      source: 'figma-plugin',
    });
  }

  /**
   * Request code generation from Claude Code
   */
  async requestCodeGeneration(designSpec: any, options: any): Promise<MCPResponse> {
    return this.sendToClaudeCode({
      action: 'generate-code',
      designSpec,
      options: Object.assign({
        framework: options.framework || 'react',
        designSystem: options.designSystem || 'tailwind',
        includeTests: options.includeTests || false,
        includeStorybook: options.includeStorybook || false,
      }, options),
    });
  }

  /**
   * Request AI-powered design suggestions
   */
  async requestDesignSuggestions(componentSpec: any, context: string): Promise<MCPResponse> {
    return this.sendToClaudeCode({
      action: 'suggest-design-improvements',
      componentSpec,
      context,
      analysisType: 'accessibility,performance,usability',
    });
  }

  /**
   * Create new component from natural language prompt
   */
  async createComponentFromPrompt(prompt: string, framework: string): Promise<MCPResponse> {
    return this.sendToClaudeCode({
      action: 'create-component-from-prompt',
      prompt,
      framework,
      context: {
        figmaFileId: figma.fileKey,
        currentPageId: figma.currentPage.id,
      },
    });
  }

  /**
   * Get design system recommendations
   */
  async getDesignSystemRecommendations(components: any[]): Promise<MCPResponse> {
    return this.sendToClaudeCode({
      action: 'analyze-design-system',
      components,
      requestType: 'recommendations',
    });
  }

  /**
   * Disconnect from MCP server
   */
  async disconnect(): Promise<void> {
    if (this.connected) {
      try {
        await this.makeRequest('/mcp-bridge/disconnect', {
          method: 'POST',
          body: JSON.stringify({
            sessionId: this.sessionId,
          }),
        });
      } catch (error) {
        console.error('Error disconnecting:', error);
      } finally {
        this.connected = false;
      }
    }
  }

  /**
   * Check connection status
   */
  async checkConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest('/mcp-bridge/ping', {
        method: 'GET',
      });
      
      this.connected = response.success;
      return this.connected;
    } catch (error) {
      this.connected = false;
      return false;
    }
  }

  // Private helper methods

  private async makeRequest(endpoint: string, options: RequestInit): Promise<MCPResponse> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'X-Plugin-Session': this.sessionId,
      'X-Plugin-Version': '1.0.0',
    };

    const requestOptions: RequestInit = Object.assign({}, options, {
      headers: Object.assign({}, defaultHeaders, options.headers),
    });

    const response = await fetch(url, requestOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data as MCPResponse;
  }

  private generateSessionId(): string {
    return `figma-plugin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Getters
  get isConnected(): boolean {
    return this.connected;
  }

  get getSessionId(): string {
    return this.sessionId;
  }
}