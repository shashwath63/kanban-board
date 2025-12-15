'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Toggle theme">
        <Sun className="h-5 w-5" />
      </button>
    );
  }

  const currentTheme = resolvedTheme || theme;

  return (
    <button
      onClick={() => setTheme(currentTheme === 'light' ? 'dark' : 'light')}
      className="rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
      aria-label="Toggle theme"
    >
      {currentTheme === 'dark' ? (
        <Sun className="h-5 w-5 text-yellow-500" />
      ) : (
        <Moon className="h-5 w-5 text-gray-700" />
      )}
    </button>
  );
}
