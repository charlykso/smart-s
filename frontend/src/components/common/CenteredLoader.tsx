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
    ? 'min-h-screen flex items-center justify-center'
    : 'flex items-center justify-center py-12';

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="text-center">
        <LoadingSpinner size={size} color={color} />
        {message && (
          <p className="mt-4 text-gray-600 text-sm">{message}</p>
        )}
      </div>
    </div>
  );
};

export default CenteredLoader;
