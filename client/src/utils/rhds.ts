/**
 * Red Hat Design System Integration Utilities
 * 
 * This file provides utilities for integrating Red Hat Design System (RHDS)
 * components into the React application.
 * 
 * For React components, use the React wrappers from @lit-labs/react:
 * @example
 * import { Button } from '@rhds/elements/react/rh-button/rh-button.js';
 * import { Card } from '@rhds/elements/react/rh-card/rh-card.js';
 * 
 * @see https://ux.redhat.com/get-started/developers/usage/#using-react-wrappers
 * @see https://ux.redhat.com/get-started/developers/installation/#npm
 */

/**
 * Dynamically import and register a Red Hat Design System element
 * @param elementName - The name of the RHDS element (e.g., 'rh-button', 'rh-card')
 */
export async function loadRHDSElement(elementName: string): Promise<void> {
  try {
    // Dynamic import of RHDS elements
    await import(`@rhds/elements/${elementName}/${elementName}.js`);
  } catch (error) {
    console.warn(`Failed to load RHDS element: ${elementName}`, error);
  }
}

/**
 * Preload commonly used RHDS elements
 */
export async function preloadRHDSElements(): Promise<void> {
  const commonElements = [
    'rh-button',
    'rh-card',
    'rh-alert',
    'rh-dialog',
    'rh-tabs',
    'rh-badge',
    'rh-tooltip',
    // Note: rh-popover may not be available in @rhds/elements@4.0.1
    // 'rh-popover',
  ];

  // Load elements sequentially to avoid overwhelming the browser
  // and to catch errors for individual elements
  for (const element of commonElements) {
    try {
      await loadRHDSElement(element);
    } catch (error) {
      // Log but don't fail - some elements may not be available
      console.debug(`RHDS element ${element} not available or failed to load:`, error);
    }
  }
}

/**
 * Apply Red Hat Design System tokens to CSS variables
 * This function can be called to sync custom CSS variables with RHDS tokens
 */
export function applyRHDSTokens(): void {
  // Red Hat Design System tokens are loaded via CSS in index.html
  // This function can be used to programmatically apply tokens if needed
  const root = document.documentElement;
  
  // Example: Apply Red Hat brand colors
  // These should match the tokens loaded from @rhds/tokens
  root.style.setProperty('--rh-color-brand-red-500', '#CC0000');
  root.style.setProperty('--rh-color-brand-red-600', '#A00000');
}

