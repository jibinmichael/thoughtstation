// 🎨 Kawaii Canvas Design Tokens
// Extracted from the original masterpiece CSS

export const colors = {
  // Brand colors
  primary: '#6366F1',
  primaryLight: 'rgba(99, 102, 241, 0.3)',
  primaryShadow: 'rgba(99, 102, 241, 0.2)',
  
  // Background colors
  canvasBg: '#ffffff',
  canvasBgAlt: '#f5f5f5',
  bodyBg: 'linear-gradient(135deg, #FFF8F0, #F7F5F3)',
  
  // Toolbar colors
  toolbarBg: '#ffffff',
  toolbarBorder: '#ececec',
  toolbarHover: 'rgba(0, 0, 0, 0.04)',
  toolbarActive: '#f5f5f5',
  
  // Circle gradient (kawaii magic)
  circleGradient: 'radial-gradient(circle at 30% 30%, #B5E3E0 0%, #E8E3C8 40%, #F5D5C8 70%, #E0D0F0 100%)',
  
  // Gray scale
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: 'rgb(156, 163, 175)',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  
  // Shadow colors
  shadow: {
    light: 'rgba(27, 29, 28, 0.1)',
    medium: 'rgba(0, 0, 0, 0.1)',
    heavy: 'rgba(0, 0, 0, 0.15)',
  },
  
  // Sticky note colors (from your color picker)
  stickyNotes: {
    default: '#FFE66D',
    white: '#ffffff',
    lavender: '#E6E6FA',
    pink: '#FFE4E1',
    yellow: '#FFEAA7',
    orange: '#FDCB6E',
    mint: '#A8E6CF',
    blue: '#B8C5FF',
    rose: '#F8BBD9',
  }
} as const;

export const fonts = {
  // Primary font family
  primary: "'DM Sans', sans-serif",
  
  // Digital display font
  digital: "'Digital-7', 'JetBrains Mono', monospace",
  
  // Additional fonts from your design
  display: "'Inter', sans-serif",
  orbitron: "'Orbitron', monospace",
  mono: "'JetBrains Mono', monospace",
} as const;

export const fontSize = {
  xs: '0.75rem',     // 12px
  sm: '0.875rem',    // 14px
  base: '1rem',      // 16px
  lg: '1.125rem',    // 18px
  xl: '1.25rem',     // 20px
  '2xl': '1.5rem',   // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem',  // 36px
  '5xl': '3rem',     // 48px
  
  // Specific sizes from your design
  messageIcon: '2.5rem',
  messageText: '1.125rem',
  messageSubtext: '0.875rem',
  tooltipText: '12px',
  zoomBtn: '24px',
} as const;

export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
  
  // Specific sizes from your design
  toolbarHeight: '84px',
  toolbarWidth: '692px',
  circleSize: '60px',
  columnWidth: '92px',
  iconSize: '72px',
  colorCircleSize: '36px',
  topToolbarHeight: '60px',
  zoomSectionWidth: '48px',
} as const;

export const borderRadius = {
  none: '0',
  sm: '2px',
  md: '4px',
  lg: '6px',
  xl: '8px',
  '2xl': '12px',
  '3xl': '16px',
  full: '50%',
  
  // Specific radii from your design
  toolbar: '12px',
  stickyNote: '8px',
  tooltip: '6px',
  colorCircle: '50%',
} as const;

export const boxShadow = {
  // Toolbar shadows
  toolbar: '0px 4px 6px -4px rgba(27, 29, 28, 0.1), 0px 10px 15px -3px rgba(27, 29, 28, 0.1)',
  toolbarDepth: '0px 4px 6px -4px rgba(27, 29, 28, 0.1), 0px 10px 15px -3px rgba(27, 29, 28, 0.1), 0px -2px 4px -1px rgba(27, 29, 28, 0.1)',
  
  // Element shadows
  stickyNote: '0 2px 4px rgba(0, 0, 0, 0.1)',
  stickyNoteHover: '0 4px 12px rgba(0, 0, 0, 0.15)',
  stickyNoteFocused: '0 4px 16px rgba(99, 102, 241, 0.2)',
  
  // Circle shadows
  circleHover: '0 4px 12px rgba(0, 0, 0, 0.15)',
  circleActive: '0 0 0 3px rgba(99, 102, 241, 0.3)',
  
  // Pomodoro widget shadow
  pomodoroWidget: '0px 2px 4px -2px rgba(27, 29, 28, 0.10), 0px 4px 6px -1px rgba(27, 29, 28, 0.10)',
} as const;

export const transitions = {
  // Durations
  fast: '0.2s ease',
  medium: '0.3s ease',
  slow: '0.5s ease',
  
  // Specific transitions from your design
  backgroundColorFast: 'background-color 0.2s ease',
  transform: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: 'box-shadow 0.2s ease',
  opacity: 'opacity 0.2s ease',
  toolbarSlide: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  all: 'all 0.2s ease',
} as const;

export const animations = {
  // Keyframes from your design
  float: 'float 3s ease-in-out infinite',
  wobble: 'wobble 0.5s ease-in-out',
  bounceSoft: 'bounce-soft 2s infinite',
  spin: 'spin 3s linear infinite',
} as const;

export const zIndex = {
  canvas: 1,
  stickyNote: 10,
  stickyNoteDragging: 1000,
  topToolbar: 99,
  bottomToolbar: 100,
  tooltip: 1000,
  modal: 1000,
} as const;

// Canvas background patterns
export const canvasPatterns = {
  plain: 'none',
  dotted: 'radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)',
  striped: 'repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(0,0,0,0.03) 20px, rgba(0,0,0,0.03) 21px)',
} as const;

export const canvasPatternSizes = {
  dotted: '20px 20px',
  striped: 'auto',
} as const;

// Responsive breakpoints
export const breakpoints = {
  mobile: '768px',
} as const;

// Specific component dimensions
export const dimensions = {
  stickyNote: {
    minWidth: '180px',
    maxWidth: '180px',
    minHeight: '54px',
    maxHeight: '300px',
    padding: '16px',
  },
  
  pomodoro: {
    width: '264px',
    headerHeight: '40px',
  },
  
  toolbar: {
    bottom: {
      width: '692px',
      height: '84px',
    },
    top: {
      height: '60px',
      padding: '12px 0',
    },
  },
} as const;

// Export all as default for easy importing
export default {
  colors,
  fonts,
  fontSize,
  spacing,
  borderRadius,
  boxShadow,
  transitions,
  animations,
  zIndex,
  canvasPatterns,
  canvasPatternSizes,
  breakpoints,
  dimensions,
} as const; 