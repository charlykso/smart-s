import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface CenteredLoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  fullScreen?: boolean;
  className?: string;
}

const CenteredLoader: React.FC<CenteredLoaderProps> = ({
  message = 'Loading...',
  size = 'lg',
  color = 'primary',
  fullScreen = true,
  className = ''
}) => {
  const containerClasses = fullScreen
    ? 'min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4'
    : 'flex items-center justify-center py-12';

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="text-center">
        {fullScreen ? (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full mx-auto">
            <LoadingSpinner size={size} color={color} />
            {message && (
              <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">{message}</p>
            )}
          </div>
        ) : (
          <>
            <LoadingSpinner size={size} color={color} />
            {message && (
              <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">{message}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CenteredLoader;
