import { ComponentSpec, SpacingObject, StateVariation, A11yAttributes } from '../types';

export class ComponentExtractor {
  
  /**
   * Extract component specifications from Figma nodes
   */
  static extractComponent(node: SceneNode): ComponentSpec {
    const baseSpec: ComponentSpec = {
      id: node.id,
      name: node.name,
      type: this.inferComponentType(node),
      properties: {
        dimensions: this.extractDimensions(node),
        colors: this.extractColors(node),
        typography: this.extractTypography(node),
        spacing: this.extractSpacing(node),
        effects: this.extractEffects(node),
        opacity: 'opacity' in node ? node.opacity || 1 : 1,
      },
      states: this.extractStates(node),
      interactions: this.extractInteractions(node),
      accessibility: this.extractAccessibility(node),
      children: this.extractChildren(node),
    };

    return baseSpec;
  }

  /**
   * Infer component type from Figma node
   */
  private static inferComponentType(node: SceneNode): ComponentSpec['type'] {
    const name = node.name.toLowerCase();
    
    if (name.includes('button') || name.includes('btn')) return 'button';
    if (name.includes('input') || name.includes('field')) return 'input';
    if (name.includes('card') || name.includes('tile')) return 'card';
    if (name.includes('layout') || name.includes('container')) return 'layout';
    if (node.type === 'TEXT') return 'text';
    if (node.type === 'RECTANGLE' || node.type === 'ELLIPSE') return 'container';
    if (name.includes('image') || name.includes('img')) return 'image';
    
    return 'custom';
  }

  /**
   * Extract dimensions from node
   */
  private static extractDimensions(node: SceneNode): { width: number; height: number } {
    return {
      width: 'width' in node ? node.width : 0,
      height: 'height' in node ? node.height : 0,
    };
  }

  /**
   * Extract color information from node
   */
  private static extractColors(node: SceneNode): ComponentSpec['properties']['colors'] {
    const colors: ComponentSpec['properties']['colors'] = {};

    if ('fills' in node && node.fills && Array.isArray(node.fills) && node.fills.length > 0) {
      const fill = node.fills[0];
      if (fill.type === 'SOLID') {
        colors.background = this.rgbaToHex(fill.color, fill.opacity);
      }
    }

    if ('strokes' in node && node.strokes && node.strokes.length > 0) {
      const stroke = node.strokes[0];
      if (stroke.type === 'SOLID') {
        colors.border = this.rgbaToHex(stroke.color, stroke.opacity);
      }
    }

    if (node.type === 'TEXT') {
      const textNode = node as TextNode;
      if (textNode.fills && Array.isArray(textNode.fills) && textNode.fills.length > 0) {
        const fill = textNode.fills[0];
        if (fill.type === 'SOLID') {
          colors.text = this.rgbaToHex(fill.color, fill.opacity);
        }
      }
    }

    return colors;
  }

  /**
   * Extract typography information
   */
  private static extractTypography(node: SceneNode): ComponentSpec['properties']['typography'] {
    if (node.type === 'TEXT') {
      const textNode = node as TextNode;
      return {
        family: typeof textNode.fontName === 'object' && textNode.fontName ? textNode.fontName.family : 'Arial',
        size: typeof textNode.fontSize === 'number' ? textNode.fontSize : 14,
        weight: this.getFontWeight(typeof textNode.fontName === 'object' && textNode.fontName ? textNode.fontName.style : 'Regular'),
        lineHeight: textNode.lineHeight && typeof textNode.lineHeight === 'object' && 'value' in textNode.lineHeight
          ? textNode.lineHeight.value : 1.2,
      };
    }

    // Default typography for non-text nodes
    return {
      family: 'Arial',
      size: 14,
      weight: 400,
      lineHeight: 1.2,
    };
  }

  /**
   * Extract spacing (padding/margin) from node layout
   */
  private static extractSpacing(node: SceneNode): { padding: SpacingObject; margin: SpacingObject } {
    // For Auto Layout frames, extract padding
    let padding: SpacingObject = { top: 0, right: 0, bottom: 0, left: 0 };
    let margin: SpacingObject = { top: 0, right: 0, bottom: 0, left: 0 };

    if ('paddingTop' in node && node.paddingTop !== undefined) {
      padding = {
        top: node.paddingTop || 0,
        right: node.paddingRight || 0,
        bottom: node.paddingBottom || 0,
        left: node.paddingLeft || 0,
      };
    }

    // Extract margin from constraints and positioning
    if ('x' in node && 'y' in node && node.parent) {
      // Calculate margins based on positioning within parent
      const parent = node.parent;
      if ('width' in parent && 'height' in parent) {
        margin = {
          top: node.y,
          left: node.x,
          bottom: parent.height - node.y - node.height,
          right: parent.width - node.x - node.width,
        };
      }
    }

    return { padding, margin };
  }

  /**
   * Extract visual effects (shadows, blurs)
   */
  private static extractEffects(node: SceneNode): ComponentSpec['properties']['effects'] {
    const effects: ComponentSpec['properties']['effects'] = [];

    if ('effects' in node && node.effects) {
      node.effects.forEach(effect => {
        if (effect.type === 'DROP_SHADOW' && effect.visible) {
          effects.push({
            type: 'drop-shadow',
            color: this.rgbaToHex(effect.color, effect.color.a || 1),
            offset: { x: effect.offset.x, y: effect.offset.y },
            blur: effect.radius,
            spread: effect.spread || 0,
          });
        }
        if (effect.type === 'INNER_SHADOW' && effect.visible) {
          effects.push({
            type: 'inner-shadow',
            color: this.rgbaToHex(effect.color, effect.color.a || 1),
            offset: { x: effect.offset.x, y: effect.offset.y },
            blur: effect.radius,
            spread: effect.spread || 0,
          });
        }
      });
    }

    return effects;
  }

  /**
   * Extract component states (hover, active, etc.)
   */
  private static extractStates(node: SceneNode): StateVariation[] {
    // Look for component variants
    if ('variantProperties' in node && node.variantProperties) {
      // This is a component variant - extract state information
      return Object.entries(node.variantProperties).map(([key, value]) => ({
        name: key.toLowerCase(),
        properties: this.extractStateProperties(node, key, value as string),
      }));
    }

    return [];
  }

  /**
   * Extract interactions and event handlers
   */
  private static extractInteractions(node: SceneNode): ComponentSpec['interactions'] {
    const interactions: ComponentSpec['interactions'] = [];

    if ('reactions' in node && node.reactions) {
      node.reactions.forEach(reaction => {
        if (reaction.trigger && reaction.trigger.type === 'ON_CLICK') {
          interactions.push({
            trigger: 'click',
            action: (reaction.action && reaction.action.type) || 'unknown',
            target: reaction.action && 'destinationId' in reaction.action 
              ? reaction.action.destinationId || undefined : undefined,
          });
        }
        if (reaction.trigger && reaction.trigger.type === 'ON_HOVER') {
          interactions.push({
            trigger: 'hover',
            action: (reaction.action && reaction.action.type) || 'unknown',
          });
        }
      });
    }

    return interactions;
  }

  /**
   * Extract accessibility attributes
   */
  private static extractAccessibility(node: SceneNode): A11yAttributes {
    const a11y: A11yAttributes = {
      focusable: this.isFocusable(node),
    };

    // Extract role based on component type
    const type = this.inferComponentType(node);
    switch (type) {
      case 'button':
        a11y.role = 'button';
        break;
      case 'input':
        a11y.role = 'textbox';
        break;
      case 'text':
        a11y.role = 'text';
        break;
    }

    // Use node name as aria-label if appropriate
    if (node.name && !node.name.startsWith('Rectangle') && !node.name.startsWith('Frame')) {
      a11y.ariaLabel = node.name;
    }

    return a11y;
  }

  /**
   * Extract child components
   */
  private static extractChildren(node: SceneNode): ComponentSpec[] {
    const children: ComponentSpec[] = [];

    if ('children' in node && node.children) {
      node.children.forEach(child => {
        if (child.visible !== false) {
          children.push(this.extractComponent(child));
        }
      });
    }

    return children;
  }

  // Helper methods
  private static rgbaToHex(color: RGB | RGBA, opacity = 1): string {
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);  
    const b = Math.round(color.b * 255);
    const a = opacity;

    if (a < 1) {
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  private static getFontWeight(style: string): number {
    const weightMap: Record<string, number> = {
      'Thin': 100,
      'Extra Light': 200,
      'Light': 300,
      'Regular': 400,
      'Medium': 500,
      'Semi Bold': 600,
      'Bold': 700,
      'Extra Bold': 800,
      'Black': 900,
    };

    return weightMap[style] || 400;
  }

  private static extractStateProperties(node: SceneNode, key: string, value: string): Partial<ComponentSpec['properties']> {
    // Extract properties that differ for this state
    // This would need to compare against the default state
    return {
      // Implementation depends on how variants are structured
      // This is a simplified version
    };
  }

  private static isFocusable(node: SceneNode): boolean {
    const type = this.inferComponentType(node);
    return ['button', 'input'].includes(type);
  }
}