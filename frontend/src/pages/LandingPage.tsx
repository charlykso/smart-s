import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UserGroupIcon,
  CurrencyDollarIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  BuildingOffice2Icon
} from '@heroicons/react/24/outline';
import { ROUTES } from '../constants';
import MobileMenu from '../components/layout/MobileMenu';

const LandingPage: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-secondary-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <AcademicCapIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-secondary-900">Smart-S</h1>
                <p className="text-xs text-secondary-600">School Management System</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-secondary-700 hover:text-primary-600 font-medium transition-colors text-sm">
                Features
              </a>
              <a href="#about" className="text-secondary-700 hover:text-primary-600 font-medium transition-colors text-sm">
                About
              </a>
              <a href="#contact" className="text-secondary-700 hover:text-primary-600 font-medium transition-colors text-sm">
                Contact
              </a>
              <Link
                to={ROUTES.LOGIN}
                className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
              >
                Sign In
              </Link>
            </nav>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden p-2 rounded-lg hover:bg-secondary-100"
              aria-label="Open mobile menu"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-600 mb-4 leading-tight">
            Complete School Management
            <br />
            <span className="text-primary-500">Solution</span>
          </h1>

          <p className="text-base md:text-lg text-secondary-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Streamline your educational institution with our comprehensive management
            system for nursery, primary, and secondary schools.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to={ROUTES.LOGIN}
              className="btn-primary text-sm px-6 py-3"
            >
              Get Started
            </Link>
            <button type="button" className="btn-secondary text-sm px-6 py-3">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-secondary-900 mb-3">
              Everything You Need to Manage Your School
            </h2>
            <p className="text-base text-secondary-600 max-w-xl mx-auto">
              Our comprehensive platform covers all aspects of school administration
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {/* User Management */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow duration-300">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
                <UserGroupIcon className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">User Management</h3>
              <p className="text-gray-600 text-xs leading-relaxed">
                Multi-role system supporting admins, teachers, students, and parents with secure authentication.
              </p>
            </div>

            {/* Fee Management */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow duration-300">
              <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center mb-3">
                <CurrencyDollarIcon className="w-5 h-5 text-yellow-500" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Fee Management</h3>
              <p className="text-gray-600 text-xs leading-relaxed">
                Complete fee collection system with Paystack integration and installment support.
              </p>
            </div>

            {/* Academic Management */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow duration-300">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mb-3">
                <BookOpenIcon className="w-5 h-5 text-purple-500" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Academic Management</h3>
              <p className="text-gray-600 text-xs leading-relaxed">
                Manage sessions, terms, classes, and academic structures with ease.
              </p>
            </div>

            {/* Reports & Analytics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow duration-300">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-3">
                <ChartBarIcon className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Reports & Analytics</h3>
              <p className="text-gray-600 text-xs leading-relaxed">
                Comprehensive reporting and audit trails for financial and academic data.
              </p>
            </div>

            {/* Security */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow duration-300">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center mb-3">
                <ShieldCheckIcon className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Security</h3>
              <p className="text-gray-600 text-xs leading-relaxed">
                Advanced encryption, JWT authentication, and role-based access control.
              </p>
            </div>

            {/* Multi-School Support */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow duration-300">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center mb-3">
                <BuildingOffice2Icon className="w-5 h-5 text-orange-500" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Multi-School Support</h3>
              <p className="text-gray-600 text-xs leading-relaxed">
                Manage multiple schools and school groups from a single platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to Transform Your School Management?
          </h2>
          <p className="text-base text-primary-100 mb-6 max-w-xl mx-auto">
            Join hundreds of schools already using Smart-S to streamline their operations
          </p>
          <Link
            to={ROUTES.LOGIN}
            className="bg-white text-primary-600 hover:bg-primary-50 font-semibold py-3 px-6 rounded-lg text-sm transition-colors inline-flex items-center space-x-2"
          >
            <span>Start Your Free Trial</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary-900 text-white py-10 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Logo & Description */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <AcademicCapIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Smart-S</h3>
                  <p className="text-xs text-secondary-400">School Management System</p>
                </div>
              </div>
              <p className="text-secondary-300 text-sm leading-relaxed">
                Empowering educational institutions with modern, efficient, and secure management solutions.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-base font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-1">
                <li><a href="#features" className="text-secondary-300 hover:text-white transition-colors text-sm">Features</a></li>
                <li><a href="#about" className="text-secondary-300 hover:text-white transition-colors text-sm">About</a></li>
                <li><a href="#contact" className="text-secondary-300 hover:text-white transition-colors text-sm">Contact</a></li>
                <li><Link to={ROUTES.LOGIN} className="text-secondary-300 hover:text-white transition-colors text-sm">Sign In</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-base font-semibold mb-3">Contact</h4>
              <ul className="space-y-1 text-secondary-300 text-sm">
                <li>support@smart-s.com</li>
                <li>+234 (0) 123 456 7890</li>
                <li>Lagos, Nigeria</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-secondary-700 mt-6 pt-6 text-center">
            <p className="text-secondary-400 text-xs">
              © 2024 Smart-S School Management System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </div>
  );
};

export default LandingPage;
