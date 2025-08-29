// Claude Code Figma Plugin - UI Logic

interface PluginState {
  connected: boolean;
  selectedNodes: any[];
  extractedSpecs: any[];
  generatedCode: string;
  framework: string;
  designSystem: string;
  isLoading: boolean;
  error?: string;
}

let pluginState: PluginState = {
  connected: false,
  selectedNodes: [],
  extractedSpecs: [],
  generatedCode: '',
  framework: 'react',
  designSystem: 'tailwind',
  isLoading: false,
};

// DOM Elements
const statusDot = document.getElementById('statusDot') as HTMLElement;
const statusText = document.getElementById('statusText') as HTMLElement;
const errorMessage = document.getElementById('errorMessage') as HTMLElement;
const loadingIndicator = document.getElementById('loadingIndicator') as HTMLElement;
const selectedNodes = document.getElementById('selectedNodes') as HTMLElement;

// Buttons
const extractButton = document.getElementById('extractButton') as HTMLButtonElement;
const generateCodeButton = document.getElementById('generateCodeButton') as HTMLButtonElement;
const syncTokensButton = document.getElementById('syncTokensButton') as HTMLButtonElement;
const createFromPromptButton = document.getElementById('createFromPromptButton') as HTMLButtonElement;
const suggestImprovementsButton = document.getElementById('suggestImprovementsButton') as HTMLButtonElement;
const checkAccessibilityButton = document.getElementById('checkAccessibilityButton') as HTMLButtonElement;
const reconnectButton = document.getElementById('reconnectButton') as HTMLButtonElement;
const closePluginButton = document.getElementById('closePluginButton') as HTMLButtonElement;
const copyCodeButton = document.getElementById('copyCodeButton') as HTMLButtonElement;

// Inputs
const frameworkSelect = document.getElementById('frameworkSelect') as HTMLSelectElement;
const designSystemSelect = document.getElementById('designSystemSelect') as HTMLSelectElement;
const includeTests = document.getElementById('includeTests') as HTMLInputElement;
const includeStorybook = document.getElementById('includeStorybook') as HTMLInputElement;
const aiPrompt = document.getElementById('aiPrompt') as HTMLTextAreaElement;
const codeTextarea = document.getElementById('codeTextarea') as HTMLTextAreaElement;
const codeOutput = document.getElementById('codeOutput') as HTMLElement;

// Initialize UI
function initializeUI() {
  setupTabs();
  setupEventListeners();
  updateUIState();
}

// Setup tab navigation
function setupTabs() {
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.getAttribute('data-tab');
      
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Update active content
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `${targetTab}-tab`) {
          content.classList.add('active');
        }
      });
    });
  });
}

// Setup event listeners
function setupEventListeners() {
  // Extract Design button
  extractButton.addEventListener('click', () => {
    parent.postMessage({ 
      pluginMessage: { 
        type: 'extract-design',
        nodeIds: pluginState.selectedNodes.map(node => node.id)
      } 
    }, '*');
  });

  // Generate Code button
  generateCodeButton.addEventListener('click', () => {
    parent.postMessage({ 
      pluginMessage: { 
        type: 'generate-code',
        framework: frameworkSelect.value,
        designSystem: designSystemSelect.value,
        includeTests: includeTests.checked,
        includeStorybook: includeStorybook.checked,
      } 
    }, '*');
  });

  // Sync Tokens button
  syncTokensButton.addEventListener('click', () => {
    parent.postMessage({ 
      pluginMessage: { type: 'sync-design-tokens' } 
    }, '*');
  });

  // Create from Prompt button
  createFromPromptButton.addEventListener('click', () => {
    const prompt = aiPrompt.value.trim();
    if (!prompt) {
      showError('Please enter a description for the component you want to create');
      return;
    }

    parent.postMessage({ 
      pluginMessage: { 
        type: 'create-component',
        prompt: prompt,
        framework: frameworkSelect.value,
      } 
    }, '*');
  });

  // Suggest Improvements button
  suggestImprovementsButton.addEventListener('click', () => {
    parent.postMessage({ 
      pluginMessage: { 
        type: 'suggest-improvements',
        nodeIds: pluginState.selectedNodes.map(node => node.id)
      } 
    }, '*');
  });

  // Check Accessibility button
  checkAccessibilityButton.addEventListener('click', () => {
    parent.postMessage({ 
      pluginMessage: { 
        type: 'check-accessibility',
        nodeIds: pluginState.selectedNodes.map(node => node.id)
      } 
    }, '*');
  });

  // Reconnect button
  reconnectButton.addEventListener('click', () => {
    parent.postMessage({ 
      pluginMessage: { type: 'reconnect' } 
    }, '*');
  });

  // Close Plugin button
  closePluginButton.addEventListener('click', () => {
    parent.postMessage({ 
      pluginMessage: { type: 'close-plugin' } 
    }, '*');
  });

  // Copy Code button
  copyCodeButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(codeTextarea.value);
      copyCodeButton.textContent = '✅ Copied!';
      setTimeout(() => {
        copyCodeButton.textContent = '📋 Copy to Clipboard';
      }, 2000);
    } catch (err) {
      showError('Failed to copy to clipboard');
    }
  });

  // Framework/Design System change handlers
  frameworkSelect.addEventListener('change', () => {
    parent.postMessage({ 
      pluginMessage: { 
        type: 'update-settings',
        framework: frameworkSelect.value
      } 
    }, '*');
  });

  designSystemSelect.addEventListener('change', () => {
    parent.postMessage({ 
      pluginMessage: { 
        type: 'update-settings',
        designSystem: designSystemSelect.value
      } 
    }, '*');
  });
}

// Handle messages from main thread
window.onmessage = (event) => {
  const message = event.data.pluginMessage;
  
  switch (message.type) {
    case 'state-update':
      updatePluginState(message.state);
      break;
      
    case 'selection-changed':
      updateSelectedNodes(message.selection);
      break;
      
    case 'design-extracted':
      handleDesignExtracted(message.specs);
      break;
      
    case 'code-generated':
      handleCodeGenerated(message.code, message.files);
      break;
      
    case 'component-created':
      handleComponentCreated(message.nodeId);
      break;
      
    case 'modifications-applied':
      handleModificationsApplied();
      break;
      
    case 'tokens-synced':
      handleTokensSynced(message.tokens);
      break;
      
    case 'claude-code-changes':
      handleClaudeCodeChanges(message.changes);
      break;
      
    case 'error':
      showError(message.error);
      break;
      
    default:
      console.log('Unknown message type:', message.type);
  }
};

// Update plugin state
function updatePluginState(newState: Partial<PluginState>) {
  pluginState = Object.assign({}, pluginState, newState);
  updateUIState();
}

// Update UI based on current state
function updateUIState() {
  // Update connection status
  if (pluginState.connected) {
    statusDot.classList.add('connected');
    statusText.textContent = 'Connected';
  } else {
    statusDot.classList.remove('connected');
    statusText.textContent = 'Disconnected';
  }

  // Update loading state
  if (pluginState.isLoading) {
    loadingIndicator.classList.add('visible');
  } else {
    loadingIndicator.classList.remove('visible');
  }

  // Update error state
  if (pluginState.error) {
    showError(pluginState.error);
  } else {
    hideError();
  }

  // Update button states
  const hasSelection = pluginState.selectedNodes.length > 0;
  const hasExtractedSpecs = pluginState.extractedSpecs.length > 0;
  
  extractButton.disabled = !hasSelection || pluginState.isLoading;
  generateCodeButton.disabled = !hasExtractedSpecs || pluginState.isLoading;
  suggestImprovementsButton.disabled = !hasSelection || pluginState.isLoading;
  checkAccessibilityButton.disabled = !hasSelection || pluginState.isLoading;

  // Update framework/design system selects
  frameworkSelect.value = pluginState.framework;
  designSystemSelect.value = pluginState.designSystem;
}

// Update selected nodes display
function updateSelectedNodes(selection: any[]) {
  pluginState.selectedNodes = selection;
  
  if (selection.length === 0) {
    selectedNodes.innerHTML = `
      <div style="color: var(--figma-color-text-secondary); font-size: 12px;">
        Select design elements to extract
      </div>
    `;
  } else {
    selectedNodes.innerHTML = selection.map(node => `
      <div class="node-item">
        <div class="node-type">${node.type}</div>
        <div>${node.name}</div>
      </div>
    `).join('');
  }
  
  updateUIState();
}

// Handle design extraction completion
function handleDesignExtracted(specs: any[]) {
  pluginState.extractedSpecs = specs;
  updateUIState();
  
  showSuccess(`Extracted ${specs.length} component${specs.length === 1 ? '' : 's'}`);
}

// Handle code generation completion
function handleCodeGenerated(code: string, files: any[]) {
  pluginState.generatedCode = code;
  codeTextarea.value = code;
  codeOutput.classList.add('visible');
  
  // Switch to generate tab if not already active
  const generateTab = document.querySelector('[data-tab="generate"]') as HTMLElement;
  if (generateTab) {
    generateTab.click();
  }
  
  showSuccess('Code generated successfully!');
}

// Handle component creation
function handleComponentCreated(nodeId: string) {
  showSuccess('Component created in Figma!');
  aiPrompt.value = ''; // Clear the prompt
}

// Handle modifications applied
function handleModificationsApplied() {
  showSuccess('Design modifications applied!');
}

// Handle tokens synced
function handleTokensSynced(tokens: any) {
  showSuccess(`Synced ${Object.keys(tokens.colors || {}).length} colors and ${Object.keys(tokens.typography || {}).length} text styles`);
}

// Handle changes from Claude Code
function handleClaudeCodeChanges(changes: any[]) {
  if (changes.length > 0) {
    showSuccess(`Received ${changes.length} update${changes.length === 1 ? '' : 's'} from Claude Code`);
    
    // Apply changes automatically or show notification
    parent.postMessage({ 
      pluginMessage: { 
        type: 'apply-modifications',
        modifications: changes
      } 
    }, '*');
  }
}

// Show error message
function showError(message: string) {
  errorMessage.textContent = message;
  errorMessage.classList.add('visible');
  
  // Auto-hide after 5 seconds
  setTimeout(hideError, 5000);
}

// Hide error message
function hideError() {
  errorMessage.classList.remove('visible');
}

// Show success message (reuse error styling but with success color)
function showSuccess(message: string) {
  const successEl = errorMessage.cloneNode(true) as HTMLElement;
  successEl.style.background = 'var(--figma-color-bg-success, #0fa958)';
  successEl.style.color = 'white';
  successEl.textContent = message;
  successEl.classList.add('visible');
  
  // Replace error element temporarily
  const parent = errorMessage.parentNode;
  if (parent) parent.insertBefore(successEl, errorMessage);
  errorMessage.style.display = 'none';
  
  // Remove after 3 seconds
  setTimeout(() => {
    if (parent) parent.removeChild(successEl);
    errorMessage.style.display = '';
  }, 3000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeUI);