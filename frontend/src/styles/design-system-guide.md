# Smart-S Design System Quick Reference

## Colors

### Primary Color (DodgerBlue #1E90FF)
```css
/* Use these Tailwind classes */
bg-primary-500     /* Main primary background */
bg-primary-600     /* Primary buttons */
bg-primary-700     /* Primary button hover */
text-primary-600   /* Primary text/links */
text-primary-700   /* Primary text hover */
border-primary-500 /* Primary borders */
ring-primary-500   /* Focus rings */
```

### Secondary Color (Slate Gray)
```css
bg-secondary-50    /* Light backgrounds */
bg-secondary-100   /* Card backgrounds */
text-secondary-900 /* Dark headings */
text-secondary-700 /* Medium text */
text-secondary-600 /* Body text */
text-secondary-500 /* Light text */
border-secondary-200 /* Light borders */
```

### Status Colors
```css
/* Success (Green) */
bg-success-500, text-success-700, border-success-500

/* Warning (Amber) */
bg-warning-500, text-warning-700, border-warning-500

/* Error (Red) */
bg-error-500, text-error-700, border-error-500
```

## Typography

### Font Family
- Primary: Open Sans (loaded from Google Fonts)
- Fallback: System fonts (ui-sans-serif, system-ui, etc.)

### Font Weights
```css
font-light    /* 300 */
font-normal   /* 400 */
font-medium   /* 500 */
font-semibold /* 600 */
font-bold     /* 700 */
font-extrabold /* 800 */
```

### Text Sizes
```css
text-xs    /* 12px */
text-sm    /* 14px */
text-base  /* 16px */
text-lg    /* 18px */
text-xl    /* 20px */
text-2xl   /* 24px */
text-3xl   /* 30px */
```

## Component Classes

### Buttons
```css
.btn-primary {
  /* Primary button style */
  @apply bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 
         text-white font-medium py-2 px-4 rounded-lg 
         transition-colors duration-200 focus:outline-none 
         focus:ring-2 focus:ring-offset-2;
}

.btn-secondary {
  /* Secondary button style */
  @apply bg-secondary-100 hover:bg-secondary-200 focus:ring-secondary-500 
         text-secondary-900 font-medium py-2 px-4 rounded-lg 
         transition-colors duration-200 focus:outline-none 
         focus:ring-2 focus:ring-offset-2;
}
```

### Form Inputs
```css
.input-field {
  @apply block w-full px-3 py-2 border border-gray-300 rounded-md 
         shadow-sm placeholder-gray-400 focus:outline-none 
         focus:ring-primary-500 focus:border-primary-500 sm:text-sm;
}
```

### Cards
```css
.card {
  @apply bg-white rounded-lg shadow-sm border border-gray-200 p-6;
}
```

## Usage Examples

### Primary Button
```jsx
<button type="button" className="btn-primary">
  Save Changes
</button>
```

### Secondary Button
```jsx
<button type="button" className="btn-secondary">
  Cancel
</button>
```

### Card Component
```jsx
<div className="card">
  <h3 className="text-lg font-semibold text-secondary-900 mb-3">
    Card Title
  </h3>
  <p className="text-secondary-600">
    Card content goes here...
  </p>
</div>
```

### Form Input
```jsx
<input
  type="text"
  className="input-field"
  placeholder="Enter your name"
/>
```

### Status Indicators
```jsx
{/* Success */}
<div className="flex items-center space-x-2">
  <div className="w-3 h-3 bg-success-500 rounded-full"></div>
  <span className="text-success-700 text-sm">Success</span>
</div>

{/* Warning */}
<div className="flex items-center space-x-2">
  <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
  <span className="text-warning-700 text-sm">Warning</span>
</div>

{/* Error */}
<div className="flex items-center space-x-2">
  <div className="w-3 h-3 bg-error-500 rounded-full"></div>
  <span className="text-error-700 text-sm">Error</span>
</div>
```

## Layout Patterns

### Page Container
```jsx
<div className="min-h-screen bg-secondary-50">
  <div className="container mx-auto px-4 py-8">
    {/* Page content */}
  </div>
</div>
```

### Grid Layout
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Grid items */}
</div>
```

## Best Practices

1. **Consistency**: Always use the defined color classes instead of custom colors
2. **Accessibility**: Ensure sufficient contrast ratios for text
3. **Hierarchy**: Use font weights and sizes to create clear visual hierarchy
4. **Spacing**: Use consistent spacing with Tailwind's spacing scale
5. **Responsive**: Design mobile-first with responsive breakpoints
6. **Focus States**: Always include focus states for interactive elements
