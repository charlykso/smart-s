# Smart-S Design System

## Color Palette

### Primary Colors
```css
/* Blue - Primary brand color */
--primary-50: #eff6ff;
--primary-100: #dbeafe;
--primary-200: #bfdbfe;
--primary-300: #93c5fd;
--primary-400: #60a5fa;
--primary-500: #3b82f6;  /* Main primary */
--primary-600: #2563eb;
--primary-700: #1d4ed8;
--primary-800: #1e40af;
--primary-900: #1e3a8a;
```

### Secondary Colors
```css
/* Gray - Secondary/neutral colors */
--secondary-50: #f8fafc;
--secondary-100: #f1f5f9;
--secondary-200: #e2e8f0;
--secondary-300: #cbd5e1;
--secondary-400: #94a3b8;
--secondary-500: #64748b;  /* Main secondary */
--secondary-600: #475569;
--secondary-700: #334155;
--secondary-800: #1e293b;
--secondary-900: #0f172a;
```

### Status Colors
```css
/* Success - Green */
--success-50: #f0fdf4;
--success-500: #22c55e;
--success-600: #16a34a;
--success-700: #15803d;

/* Warning - Amber */
--warning-50: #fffbeb;
--warning-500: #f59e0b;
--warning-600: #d97706;
--warning-700: #b45309;

/* Error - Red */
--error-50: #fef2f2;
--error-500: #ef4444;
--error-600: #dc2626;
--error-700: #b91c1c;

/* Info - Cyan */
--info-50: #ecfeff;
--info-500: #06b6d4;
--info-600: #0891b2;
--info-700: #0e7490;
```

## Typography

### Font Family
- **Primary**: Inter (Google Fonts)
- **Fallback**: system-ui, -apple-system, sans-serif

### Font Sizes & Line Heights
```css
/* Headings */
.text-xs { font-size: 0.75rem; line-height: 1rem; }      /* 12px */
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }  /* 14px */
.text-base { font-size: 1rem; line-height: 1.5rem; }     /* 16px */
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }  /* 18px */
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }   /* 20px */
.text-2xl { font-size: 1.5rem; line-height: 2rem; }      /* 24px */
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; } /* 30px */
.text-4xl { font-size: 2.25rem; line-height: 2.5rem; }   /* 36px */
```

### Font Weights
```css
.font-light { font-weight: 300; }
.font-normal { font-weight: 400; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
```

## Spacing System

### Margin & Padding Scale
```css
/* Based on 0.25rem (4px) increments */
.p-1 { padding: 0.25rem; }    /* 4px */
.p-2 { padding: 0.5rem; }     /* 8px */
.p-3 { padding: 0.75rem; }    /* 12px */
.p-4 { padding: 1rem; }       /* 16px */
.p-5 { padding: 1.25rem; }    /* 20px */
.p-6 { padding: 1.5rem; }     /* 24px */
.p-8 { padding: 2rem; }       /* 32px */
.p-10 { padding: 2.5rem; }    /* 40px */
.p-12 { padding: 3rem; }      /* 48px */
```

## Component Specifications

### Buttons

#### Primary Button
```css
/* Base styles */
background: var(--primary-600);
color: white;
padding: 0.5rem 1rem;
border-radius: 0.375rem;
font-weight: 500;
font-size: 0.875rem;

/* Hover state */
background: var(--primary-700);

/* Focus state */
box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);

/* Disabled state */
background: var(--secondary-300);
color: var(--secondary-500);
```

#### Secondary Button
```css
background: white;
color: var(--secondary-700);
border: 1px solid var(--secondary-300);
padding: 0.5rem 1rem;
border-radius: 0.375rem;
```

#### Danger Button
```css
background: var(--error-600);
color: white;
padding: 0.5rem 1rem;
border-radius: 0.375rem;
```

### Form Elements

#### Input Fields
```css
/* Base input */
border: 1px solid var(--secondary-300);
border-radius: 0.375rem;
padding: 0.5rem 0.75rem;
font-size: 0.875rem;
background: white;

/* Focus state */
border-color: var(--primary-500);
box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);

/* Error state */
border-color: var(--error-500);
box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
```

#### Select Dropdown
```css
border: 1px solid var(--secondary-300);
border-radius: 0.375rem;
padding: 0.5rem 2rem 0.5rem 0.75rem;
background-image: url("data:image/svg+xml...");
background-position: right 0.5rem center;
background-repeat: no-repeat;
```

### Cards

#### Base Card
```css
background: white;
border-radius: 0.5rem;
box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
padding: 1.5rem;
border: 1px solid var(--secondary-200);
```

#### Elevated Card
```css
background: white;
border-radius: 0.5rem;
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
padding: 1.5rem;
```

### Navigation

#### Sidebar Menu Item
```css
/* Base state */
padding: 0.5rem 1rem;
border-radius: 0.375rem;
color: var(--secondary-600);
font-weight: 500;

/* Active state */
background: var(--primary-50);
color: var(--primary-700);

/* Hover state */
background: var(--secondary-50);
color: var(--secondary-900);
```

## Layout Grid

### Container Sizes
```css
/* Max widths for different screen sizes */
.container-sm { max-width: 640px; }   /* Small screens */
.container-md { max-width: 768px; }   /* Medium screens */
.container-lg { max-width: 1024px; }  /* Large screens */
.container-xl { max-width: 1280px; }  /* Extra large screens */
.container-2xl { max-width: 1536px; } /* 2X large screens */
```

### Grid System
```css
/* 12-column grid */
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }
```

## Breakpoints

### Responsive Design Points
```css
/* Mobile first approach */
/* xs: 0px - 639px (default) */
sm: 640px;   /* Small devices (landscape phones) */
md: 768px;   /* Medium devices (tablets) */
lg: 1024px;  /* Large devices (laptops) */
xl: 1280px;  /* Extra large devices (desktops) */
2xl: 1536px; /* 2X large devices (large desktops) */
```

## Shadows & Elevation

### Shadow Scale
```css
.shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
.shadow { box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1); }
.shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
.shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
.shadow-xl { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
```

## Animation & Transitions

### Transition Durations
```css
.duration-75 { transition-duration: 75ms; }
.duration-100 { transition-duration: 100ms; }
.duration-150 { transition-duration: 150ms; }
.duration-200 { transition-duration: 200ms; }
.duration-300 { transition-duration: 300ms; }
.duration-500 { transition-duration: 500ms; }
```

### Easing Functions
```css
.ease-linear { transition-timing-function: linear; }
.ease-in { transition-timing-function: cubic-bezier(0.4, 0, 1, 1); }
.ease-out { transition-timing-function: cubic-bezier(0, 0, 0.2, 1); }
.ease-in-out { transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }
```

### Custom Animations
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    transform: translateY(10px); 
    opacity: 0; 
  }
  to { 
    transform: translateY(0); 
    opacity: 1; 
  }
}

@keyframes slideDown {
  from { 
    transform: translateY(-10px); 
    opacity: 0; 
  }
  to { 
    transform: translateY(0); 
    opacity: 1; 
  }
}
```

## Icons & Imagery

### Icon Guidelines
- **Size**: Use consistent icon sizes (16px, 20px, 24px)
- **Style**: Heroicons outline for most cases, solid for emphasis
- **Color**: Match text color or use semantic colors

### Image Guidelines
- **Aspect Ratios**: 16:9 for banners, 1:1 for avatars, 4:3 for cards
- **Quality**: Use WebP format when possible
- **Loading**: Implement lazy loading for performance

## Accessibility

### Color Contrast
- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text**: Minimum 3:1 contrast ratio
- **Interactive elements**: Minimum 3:1 contrast ratio

### Focus States
- **Visible focus indicators** for all interactive elements
- **Consistent focus styling** across components
- **Keyboard navigation** support

### ARIA Labels
- **Descriptive labels** for all form elements
- **Role attributes** for custom components
- **Screen reader** friendly content structure

This design system ensures consistency, accessibility, and maintainability across the Smart-S frontend application.
