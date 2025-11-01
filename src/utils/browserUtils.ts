/**
 * Browser detection utilities for handling Chrome-specific rendering issues
 */

export const isChrome = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent;
  return /Chrome/.test(userAgent) && !/Edg/.test(userAgent);
};

export const isSafari = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent;
  return /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
};

export const getChromeButtonClasses = (baseClasses: string): string => {
  if (!isChrome()) return baseClasses;
  
  // Add Chrome-specific classes to prevent oversized buttons
  const chromeClasses = [
    'box-border',
    '!flex',
    '!items-center',
    '!justify-center',
    'shrink-0'
  ].join(' ');
  
  return `${baseClasses} ${chromeClasses}`;
};

export const getChromeButtonStyle = (size?: 'sm' | 'default' | 'lg' | 'icon'): React.CSSProperties => {
  if (!isChrome()) return {};
  
  const sizeMap = {
    sm: { height: '2.25rem', minHeight: '2.25rem', maxHeight: '2.25rem' },
    default: { height: '2.5rem', minHeight: '2.5rem', maxHeight: '2.5rem' },
    lg: { height: '2.75rem', minHeight: '2.75rem', maxHeight: '2.75rem' },
    icon: { height: '2.5rem', width: '2.5rem', minHeight: '2.5rem', maxHeight: '2.5rem', minWidth: '2.5rem', maxWidth: '2.5rem' }
  };
  
  return {
    boxSizing: 'border-box',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...sizeMap[size || 'default']
  };
};