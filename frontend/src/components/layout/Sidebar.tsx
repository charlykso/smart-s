import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  XMarkIcon,
  HomeIcon,
  UsersIcon,
  CurrencyDollarIcon,
  DocumentChartBarIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuthStore } from '../../store/authStore';
import { ROUTES } from '../../constants';
import { cn } from '../../utils';

// Local types to avoid import issues
type UserRole = 'Admin' | 'ICT_administrator' | 'Auditor' | 'Proprietor' | 'Principal' | 'Headteacher' | 'Bursar' | 'Student' | 'Parent';

interface MenuItem {
  id: string;
  label: string;
  icon?: React.ComponentType<any>;
  path?: string;
  children?: MenuItem[];
  roles?: UserRole[];
}

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

// Navigation items with role-based access
const navigation: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: HomeIcon,
    path: ROUTES.DASHBOARD,
  },
  {
    id: 'users',
    label: 'Users',
    icon: UsersIcon,
    path: ROUTES.USERS,
    roles: ['Admin', 'ICT_administrator', 'Principal', 'Headteacher'] as UserRole[],
  },
  {
    id: 'schools',
    label: 'Schools',
    icon: BuildingOfficeIcon,
    path: ROUTES.SCHOOLS,
    roles: ['Admin', 'ICT_administrator', 'Proprietor'] as UserRole[],
  },  {
    id: 'academic',
    label: 'Academic',
    icon: BuildingOfficeIcon,
    children: [
      {
        id: 'sessions',
        label: 'Sessions',
        path: ROUTES.SESSIONS,
        roles: ['Admin', 'ICT_administrator', 'Principal', 'Headteacher'] as UserRole[],
      },
      {
        id: 'terms',
        label: 'Terms',
        path: ROUTES.TERMS,
        roles: ['Admin', 'ICT_administrator', 'Principal', 'Headteacher'] as UserRole[],
      },
      {
        id: 'class-arms',
        label: 'Class Arms',
        path: ROUTES.CLASS_ARMS,
        roles: ['Admin', 'ICT_administrator', 'Principal', 'Headteacher'] as UserRole[],
      },
    ],
  },
  {
    id: 'fees',
    label: 'Fee Management',
    icon: CurrencyDollarIcon,
    roles: ['Admin', 'ICT_administrator', 'Principal', 'Headteacher', 'Bursar', 'Student', 'Parent'] as UserRole[],
    children: [
      {
        id: 'fee-admin',
        label: 'Fee Administration',
        path: ROUTES.FEES,
        roles: ['Admin', 'ICT_administrator', 'Principal', 'Headteacher', 'Bursar'] as UserRole[],
      },
      {
        id: 'student-payments',
        label: 'My Fee Payments',
        path: ROUTES.STUDENT_FEES,
        roles: ['Student', 'Parent'] as UserRole[],
      },
      {
        id: 'cash-payments',
        label: 'Cash Payments',
        path: ROUTES.BURSAR_CASH_PAYMENTS,
        roles: ['Admin', 'ICT_administrator', 'Bursar'] as UserRole[],
      },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: DocumentChartBarIcon,
    path: ROUTES.REPORTS,
    roles: ['Admin', 'ICT_administrator', 'Auditor', 'Principal', 'Headteacher', 'Bursar'] as UserRole[],
  },
  {
    id: 'audit',
    label: 'Audit',
    icon: ShieldCheckIcon,
    path: ROUTES.AUDIT,
    roles: ['Admin', 'ICT_administrator', 'Auditor'] as UserRole[],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Cog6ToothIcon,
    roles: ['Admin', 'ICT_administrator', 'Principal', 'Headteacher'] as UserRole[],
    children: [
      {
        id: 'general-settings',
        label: 'General Settings',
        path: ROUTES.SETTINGS,
        roles: ['Admin', 'ICT_administrator', 'Principal', 'Headteacher'] as UserRole[],
      },
      {
        id: 'email-config',
        label: 'Email Configuration',
        path: ROUTES.EMAIL_CONFIG,
        roles: ['Admin', 'ICT_administrator'] as UserRole[],
      },
      {
        id: 'payment-config',
        label: 'Payment Configuration',
        path: ROUTES.PAYMENT_CONFIG,
        roles: ['Admin', 'ICT_administrator'] as UserRole[],
      },
      {
        id: 'student-management',
        label: 'Student Management',
        path: ROUTES.STUDENT_MANAGEMENT,
        roles: ['Admin', 'ICT_administrator', 'Proprietor'] as UserRole[],
      },
    ],
  },
];

const Sidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, hasAnyRole } = useAuthStore();

  // Filter navigation items based on user roles
  const filteredNavigation = navigation.filter((item) => {
    if (!item.roles) return true; // No role restriction
    return hasAnyRole(item.roles);
  });

  const isActiveRoute = (path?: string) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleNavigation = (path?: string) => {
    if (path) {
      navigate(path);
      setOpen(false); // Close mobile sidebar
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">      {/* Logo */}
      <div className="flex items-center h-16 flex-shrink-0 px-4 bg-primary-600 dark:bg-primary-700">
        <div className="flex items-center">          <div className="flex-shrink-0">
            <img src="/ledgrio1.svg" alt="Ledgrio" className="h-8 w-8 rounded" />
          </div>
          <div className="ml-3">
            <h1 className="text-white text-lg font-semibold">Ledgrio</h1>
            <p className="text-primary-200 dark:text-primary-300 text-xs">School Accounting System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-5 flex-1 px-2 bg-white dark:bg-gray-800 space-y-1 overflow-y-auto transition-colors duration-200">
        {filteredNavigation.map((item) => {
          if (item.children) {
            // Render submenu
            return (
              <div key={item.id} className="space-y-1">
                <div className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wide px-3 py-2">
                  {item.label}
                </div>
                {item.children
                  .filter((child) => !child.roles || hasAnyRole(child.roles))
                  .map((child) => (
                    <button
                      type="button"
                      key={child.id}
                      onClick={() => handleNavigation(child.path)}
                      className={cn(
                        isActiveRoute(child.path)
                          ? 'bg-primary-100 dark:bg-primary-900 text-primary-900 dark:text-primary-100'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100',
                        'group w-full flex items-center pl-7 pr-2 py-2 text-sm font-medium rounded-md transition-colors duration-150'
                      )}
                    >
                      {child.label}
                    </button>
                  ))}
              </div>
            );
          }

          // Render regular menu item
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={cn(
                isActiveRoute(item.path)
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-900 dark:text-primary-100'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100',
                'group w-full flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150'
              )}
            >
              {item.icon && (
                <item.icon
                  className={cn(
                    isActiveRoute(item.path)
                      ? 'text-primary-500 dark:text-primary-400'
                      : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400',
                    'mr-3 flex-shrink-0 h-6 w-6 transition-colors duration-150'
                  )}
                  aria-hidden="true"
                />
              )}
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User info */}
      <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 transition-colors duration-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
              <span className="text-sm font-medium text-primary-600 dark:text-primary-300">
                {user ? user.firstname.charAt(0) + user.lastname.charAt(0) : 'U'}
              </span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {user ? `${user.firstname} ${user.lastname}` : 'User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user?.roles?.[0] || 'User'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-40 md:hidden" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 flex z-40">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                      type="button"
                      className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                      onClick={() => setOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                <SidebarContent />
              </Dialog.Panel>
            </Transition.Child>
            <div className="flex-shrink-0 w-14">{/* Force sidebar to shrink to fit close icon */}</div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-200">
          <SidebarContent />
        </div>
      </div>
    </>
  );
};

export default Sidebar;
