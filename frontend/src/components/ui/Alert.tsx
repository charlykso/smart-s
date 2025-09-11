import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { 
  ExclamationTriangleIcon, 
  InformationCircleIcon, 
  CheckCircleIcon, 
  XCircleIcon 
} from '@heroicons/react/24/outline';

const alertVariants = cva(
  'relative w-full rounded-lg border p-4',
  {
    variants: {
      variant: {
        default: 'border-secondary-200 bg-white text-secondary-900',
        destructive: 'border-error-200 bg-error-50 text-error-900',
        warning: 'border-warning-200 bg-warning-50 text-warning-900',
        success: 'border-success-200 bg-success-50 text-success-900',
        info: 'border-info-200 bg-info-50 text-info-900',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const iconVariants = cva('h-5 w-5', {
  variants: {
    variant: {
      default: 'text-secondary-600',
      destructive: 'text-error-600',
      warning: 'text-warning-600',
      success: 'text-success-600',
      info: 'text-info-600',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, title, description, icon, dismissible, onDismiss, children, ...props }, ref) => {
    const getDefaultIcon = () => {
      switch (variant) {
        case 'destructive':
          return <XCircleIcon className={iconVariants({ variant })} />;
        case 'warning':
          return <ExclamationTriangleIcon className={iconVariants({ variant })} />;
        case 'success':
          return <CheckCircleIcon className={iconVariants({ variant })} />;
        case 'info':
          return <InformationCircleIcon className={iconVariants({ variant })} />;
        default:
          return <InformationCircleIcon className={iconVariants({ variant })} />;
      }
    };

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant, className }))}
        {...props}
      >
        <div className="flex">
          <div className="flex-shrink-0">
            {icon || getDefaultIcon()}
          </div>
          <div className="ml-3 flex-1">
            {title && (
              <h3 className="text-sm font-medium">
                {title}
              </h3>
            )}
            {description && (
              <div className={cn('text-sm', title && 'mt-1')}>
                {description}
              </div>
            )}
            {children && (
              <div className={cn('text-sm', (title || description) && 'mt-2')}>
                {children}
              </div>
            )}
          </div>
          {dismissible && (
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  type="button"
                  onClick={onDismiss}
                  className={cn(
                    'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                    {
                      'text-secondary-500 hover:bg-secondary-100 focus:ring-secondary-600': variant === 'default',
                      'text-error-500 hover:bg-error-100 focus:ring-error-600': variant === 'destructive',
                      'text-warning-500 hover:bg-warning-100 focus:ring-warning-600': variant === 'warning',
                      'text-success-500 hover:bg-success-100 focus:ring-success-600': variant === 'success',
                      'text-info-500 hover:bg-info-100 focus:ring-info-600': variant === 'info',
                    }
                  )}
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

Alert.displayName = 'Alert';

export { Alert, alertVariants };
