/**
 * Chrome Compatibility Utilities
 * Handles browser-specific rendering differences
 */
import React from 'react';

export const chromeCompatibilityClasses = {
  // Button fixes
  button: "chrome-button-fix",
  
  // Container fixes
  container: "chrome-container-fix",
  
  // Text fixes
  text: "chrome-text-fix",
  
  // Card fixes
  card: "chrome-card-fix"
};

/**
 * Applies Chrome-specific fixes to an element
 */
export const applyChromeCompatibility = (element: HTMLElement) => {
  if (!element) return;
  
  // Detect Chrome
  const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
  
  if (isChrome) {
    // Force consistent box-sizing
    element.style.boxSizing = 'border-box';
    (element.style as any).webkitBoxSizing = 'border-box';
    
    // Fix font rendering
    (element.style as any).webkitFontSmoothing = 'antialiased';
    element.style.textRendering = 'optimizeLegibility';
    
    // Fix scaling issues
    (element.style as any).zoom = '1';
    element.style.transform = 'scale(1)';
    element.style.transformOrigin = '0 0';
  }
};

/**
 * Chrome-specific CSS class names for consistent styling
 */
export const getChromeCompatibleClassName = (baseClassName: string): string => {
  const isChrome = typeof window !== 'undefined' && 
    /Chrome/.test(navigator.userAgent) && 
    /Google Inc/.test(navigator.vendor);
  
  if (isChrome) {
    return `${baseClassName} chrome-compat`;
  }
  
  return baseClassName;
};

/**
 * Detects if the current browser is Chrome
 */
export const isChromeBrowser = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
};

/**
 * Gets Chrome-specific style overrides
 */
export const getChromeStyleOverrides = (): React.CSSProperties => {
  if (!isChromeBrowser()) return {};
  
  return {
    boxSizing: 'border-box' as const,
    textRendering: 'optimizeLegibility' as const,
    transform: 'scale(1)',
    transformOrigin: '0 0',
    // Chrome-specific properties as any to avoid TypeScript errors
    ...(isChromeBrowser() && {
      WebkitBoxSizing: 'border-box',
      WebkitFontSmoothing: 'antialiased',
      zoom: 1
    } as any)
  };
};