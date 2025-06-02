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
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-secondary-200">
            <h2 className="text-lg font-semibold text-secondary-900">Menu</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-secondary-100"
              aria-label="Close menu"
            >
              <XMarkIcon className="w-6 h-6 text-secondary-600" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4">
            <div className="space-y-4">
              <a 
                href="#features" 
                className="block text-secondary-700 hover:text-primary-600 font-medium py-2"
                onClick={onClose}
              >
                Features
              </a>
              <a 
                href="#about" 
                className="block text-secondary-700 hover:text-primary-600 font-medium py-2"
                onClick={onClose}
              >
                About
              </a>
              <a 
                href="#contact" 
                className="block text-secondary-700 hover:text-primary-600 font-medium py-2"
                onClick={onClose}
              >
                Contact
              </a>
            </div>
          </nav>

          {/* Sign In Button */}
          <div className="p-4 border-t border-secondary-200">
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
