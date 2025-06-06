import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ROUTES } from '../../constants';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white dark:bg-gray-800 shadow-xl dark:shadow-gray-900 transition-colors duration-200">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-secondary-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-gray-100">Menu</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close menu"
            >
              <XMarkIcon className="w-6 h-6 text-secondary-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4">
            <div className="space-y-4">
              <a
                href="#features"
                className="block text-secondary-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium py-2 transition-colors"
                onClick={onClose}
              >
                Features
              </a>
              <a
                href="#about"
                className="block text-secondary-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium py-2 transition-colors"
                onClick={onClose}
              >
                About
              </a>
              <a
                href="#contact"
                className="block text-secondary-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium py-2 transition-colors"
                onClick={onClose}
              >
                Contact
              </a>
            </div>
          </nav>

          {/* Sign In Button */}
          <div className="p-4 border-t border-secondary-200 dark:border-gray-700">
            <Link
              to={ROUTES.LOGIN}
              className="btn-primary w-full text-center"
              onClick={onClose}
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
