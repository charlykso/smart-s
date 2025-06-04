import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import {
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { useThemeStore, type Theme } from '../../store/themeStore';
import { cn } from '../../utils';

interface ThemeOption {
  value: Theme;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const themeOptions: ThemeOption[] = [
  {
    value: 'light',
    label: 'Light',
    icon: SunIcon,
    description: 'Light mode',
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: MoonIcon,
    description: 'Dark mode',
  },
  {
    value: 'system',
    label: 'System',
    icon: ComputerDesktopIcon,
    description: 'Follow system preference',
  },
];

interface ThemeToggleProps {
  variant?: 'button' | 'dropdown';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'dropdown',
  size = 'md',
  showLabel = false,
  className = '',
}) => {
  const { theme, isDarkMode, setTheme, toggleTheme } = useThemeStore();

  const currentTheme = themeOptions.find(option => option.value === theme);
  const CurrentIcon = currentTheme?.icon || SunIcon;

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const buttonSizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
  };

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={cn(
          'inline-flex items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
          'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
          buttonSizeClasses[size],
          className
        )}
        title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      >
        <CurrentIcon className={sizeClasses[size]} />
        {showLabel && (
          <span className="ml-2 text-sm font-medium">
            {currentTheme?.label}
          </span>
        )}
      </button>
    );
  }

  return (
    <Menu as="div" className={cn('relative inline-block text-left', className)}>
      <div>
        <Menu.Button className={cn(
          'inline-flex items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
          'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
          buttonSizeClasses[size]
        )}>
          <CurrentIcon className={sizeClasses[size]} />
          {showLabel && (
            <>
              <span className="ml-2 text-sm font-medium">
                {currentTheme?.label}
              </span>
              <ChevronDownIcon className="ml-1 h-4 w-4" />
            </>
          )}
          {!showLabel && (
            <ChevronDownIcon className="ml-1 h-3 w-3" />
          )}
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-700">
          <div className="py-1">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const isActive = theme === option.value;
              
              return (
                <Menu.Item key={option.value}>
                  {({ active }) => (
                    <button
                      type="button"
                      onClick={() => setTheme(option.value)}
                      className={cn(
                        'group flex w-full items-center px-4 py-2 text-sm',
                        active
                          ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100'
                          : 'text-gray-700 dark:text-gray-300',
                        isActive && 'bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                      )}
                    >
                      <Icon className="mr-3 h-4 w-4" />
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {option.description}
                        </span>
                      </div>
                      {isActive && (
                        <div className="ml-auto h-2 w-2 rounded-full bg-primary-600 dark:bg-primary-400" />
                      )}
                    </button>
                  )}
                </Menu.Item>
              );
            })}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default ThemeToggle;
