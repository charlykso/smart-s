import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-3 py-0.5 text-[10px] tracking-wide font-extrabold uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary-600 text-white shadow-sm hover:bg-primary-700',
        secondary: 'border-transparent bg-secondary-100 text-secondary-900 shadow-sm hover:bg-secondary-200',
        destructive: 'border-transparent bg-error-600 text-white shadow-sm hover:bg-error-700',
        success: 'border-transparent bg-success-600 text-white shadow-sm hover:bg-success-700',
        warning: 'border-transparent bg-warning-600 text-white shadow-sm hover:bg-warning-700',
        outline: 'border-secondary-300 text-secondary-900',
        info: 'border-transparent bg-info-600 text-white shadow-sm hover:bg-info-700',
      },
      size: {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-3 py-0.5 text-[11px]',
        lg: 'px-3.5 py-1 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, icon, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size, className }))}
        {...props}
      >
        {icon && <span className="mr-1">{icon}</span>}
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
