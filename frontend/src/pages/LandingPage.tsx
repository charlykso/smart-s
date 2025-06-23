import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UserGroupIcon,
  CurrencyDollarIcon,
  BookOpenIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  BuildingOffice2Icon
} from '@heroicons/react/24/outline';
import { ROUTES } from '../constants';
import MobileMenu from '../components/layout/MobileMenu';

const LandingPage: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-900 border-b border-secondary-200 dark:border-gray-700 transition-colors duration-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">            {/* Logo */}            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 flex items-center justify-center">
                <img src="/ledgrio1.svg" alt="Ledgrio" className="w-8 h-8 rounded" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-secondary-900 dark:text-gray-100">Ledgrio</h1>
                <p className="text-xs text-secondary-600 dark:text-gray-400">School Accounting System</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-secondary-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors text-sm">
                Features
              </a>
              <a href="#about" className="text-secondary-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors text-sm">
                About
              </a>
              <a href="#contact" className="text-secondary-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors text-sm">
                Contact
              </a>
              <Link
                to={ROUTES.LOGIN}
                className="bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
              >
                Sign In
              </Link>
            </nav>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-gray-700 text-secondary-700 dark:text-gray-300 transition-colors"
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
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-600 dark:text-primary-400 mb-4 leading-tight">
            Complete School Accounting
            <br />
            <span className="text-primary-500 dark:text-primary-300">Solution</span>
          </h1>

          <p className="text-base md:text-lg text-secondary-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Streamline your educational institution's financial management with our comprehensive accounting
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
      <section id="features" className="py-16 px-4 bg-gray-50 dark:bg-gray-800 transition-colors duration-200">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-secondary-900 dark:text-gray-100 mb-3">
              Everything You Need for School Financial Management
            </h2>
            <p className="text-base text-secondary-600 dark:text-gray-300 max-w-xl mx-auto">
              Our comprehensive platform covers all aspects of school financial administration and accounting
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {/* User Management */}
            <div className="bg-white dark:bg-gray-700 rounded-xl shadow-sm dark:shadow-gray-900 border border-gray-200 dark:border-gray-600 p-5 hover:shadow-md dark:hover:shadow-gray-900 transition-all duration-300">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-3">
                <UserGroupIcon className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Financial User Management</h3>
              <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed">
                Multi-role system supporting financial admins, bursars, students, and parents with secure authentication.
              </p>
            </div>

            {/* Fee Management */}
            <div className="bg-white dark:bg-gray-700 rounded-xl shadow-sm dark:shadow-gray-900 border border-gray-200 dark:border-gray-600 p-5 hover:shadow-md dark:hover:shadow-gray-900 transition-all duration-300">
              <div className="w-10 h-10 bg-yellow-50 dark:bg-yellow-900 rounded-lg flex items-center justify-center mb-3">
                <CurrencyDollarIcon className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Fee Collection & Management</h3>
              <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed">
                Complete fee collection system with Paystack/Flutterwave integration and installment support.
              </p>
            </div>

            {/* Academic Management */}
            <div className="bg-white dark:bg-gray-700 rounded-xl shadow-sm dark:shadow-gray-900 border border-gray-200 dark:border-gray-600 p-5 hover:shadow-md dark:hover:shadow-gray-900 transition-all duration-300">
              <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-3">
                <BookOpenIcon className="w-5 h-5 text-purple-500 dark:text-purple-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Academic Financial Structure</h3>
              <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed">
                Manage sessions, terms, classes, and fee structures aligned with academic periods.
              </p>
            </div>

            {/* Reports & Analytics */}
            <div className="bg-white dark:bg-gray-700 rounded-xl shadow-sm dark:shadow-gray-900 border border-gray-200 dark:border-gray-600 p-5 hover:shadow-md dark:hover:shadow-gray-900 transition-all duration-300">
              <div className="w-10 h-10 bg-green-50 dark:bg-green-900 rounded-lg flex items-center justify-center mb-3">
                <ChartBarIcon className="w-5 h-5 text-green-500 dark:text-green-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Financial Reports & Audit</h3>
              <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed">
                Comprehensive financial reporting and audit trails for complete transparency and compliance.
              </p>
            </div>

            {/* Security */}
            <div className="bg-white dark:bg-gray-700 rounded-xl shadow-sm dark:shadow-gray-900 border border-gray-200 dark:border-gray-600 p-5 hover:shadow-md dark:hover:shadow-gray-900 transition-all duration-300">
              <div className="w-10 h-10 bg-red-50 dark:bg-red-900 rounded-lg flex items-center justify-center mb-3">
                <ShieldCheckIcon className="w-5 h-5 text-red-500 dark:text-red-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Security & Compliance</h3>
              <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed">
                Advanced encryption, JWT authentication, and role-based access control for financial data protection.
              </p>
            </div>

            {/* Multi-School Support */}
            <div className="bg-white dark:bg-gray-700 rounded-xl shadow-sm dark:shadow-gray-900 border border-gray-200 dark:border-gray-600 p-5 hover:shadow-md dark:hover:shadow-gray-900 transition-all duration-300">
              <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-3">
                <BuildingOffice2Icon className="w-5 h-5 text-orange-500 dark:text-orange-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Real-time Financial Updates</h3>
              <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed">
                Real-time payment processing and financial updates with instant notifications and reporting.
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
            Join hundreds of schools already using Ledgrio to streamline their operations
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
      <footer className="bg-secondary-900 dark:bg-gray-900 text-white py-10 px-4 transition-colors duration-200">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">            {/* Logo & Description */}
            <div className="md:col-span-2">              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 flex items-center justify-center">
                  <img src="/ledgrio1.svg" alt="Ledgrio" className="w-8 h-8 rounded" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Ledgrio</h3>
                  <p className="text-xs text-secondary-400 dark:text-gray-400">School Management System</p>
                </div>
              </div>
              <p className="text-secondary-300 dark:text-gray-300 text-sm leading-relaxed">
                Empowering educational institutions with modern, efficient, and secure management solutions.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-base font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-1">
                <li><a href="#features" className="text-secondary-300 dark:text-gray-300 hover:text-white transition-colors text-sm">Features</a></li>
                <li><a href="#about" className="text-secondary-300 dark:text-gray-300 hover:text-white transition-colors text-sm">About</a></li>
                <li><a href="#contact" className="text-secondary-300 dark:text-gray-300 hover:text-white transition-colors text-sm">Contact</a></li>
                <li><Link to={ROUTES.LOGIN} className="text-secondary-300 dark:text-gray-300 hover:text-white transition-colors text-sm">Sign In</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-base font-semibold mb-3">Contact</h4>
              <ul className="space-y-1 text-secondary-300 dark:text-gray-300 text-sm">
                <li>support@ledgrio.com</li>
                <li>+234 (0) 123 456 7890</li>
                <li>Lagos, Nigeria</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-secondary-700 dark:border-gray-700 mt-6 pt-6 text-center">
            <p className="text-secondary-400 dark:text-gray-400 text-xs">
              © 2024 Ledgrio School Management System. All rights reserved.
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
