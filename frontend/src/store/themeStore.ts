import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  isDarkMode: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initializeTheme: () => void;
}

const getSystemTheme = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const applyTheme = (isDark: boolean) => {
  if (typeof window === 'undefined') return;
  
  const root = window.document.documentElement;
  
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      isDarkMode: false,

      setTheme: (theme: Theme) => {
        let isDark = false;
        
        switch (theme) {
          case 'dark':
            isDark = true;
            break;
          case 'light':
            isDark = false;
            break;
          case 'system':
            isDark = getSystemTheme();
            break;
        }

        applyTheme(isDark);
        
        set({ theme, isDarkMode: isDark });
      },

      toggleTheme: () => {
        const { theme } = get();
        if (theme === 'system') {
          // If currently system, toggle to opposite of current system preference
          const systemIsDark = getSystemTheme();
          get().setTheme(systemIsDark ? 'light' : 'dark');
        } else {
          // Toggle between light and dark
          get().setTheme(theme === 'light' ? 'dark' : 'light');
        }
      },

      initializeTheme: () => {
        const { theme } = get();
        get().setTheme(theme);
        
        // Listen for system theme changes
        if (typeof window !== 'undefined') {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          const handleChange = () => {
            const { theme } = get();
            if (theme === 'system') {
              get().setTheme('system');
            }
          };
          
          mediaQuery.addEventListener('change', handleChange);
          
          // Cleanup function (though Zustand doesn't have built-in cleanup)
          return () => mediaQuery.removeEventListener('change', handleChange);
        }
      },
    }),
    {
      name: 'smart-s-theme',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);

// Initialize theme on store creation
if (typeof window !== 'undefined') {
  useThemeStore.getState().initializeTheme();
}
