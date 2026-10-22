'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon, Zap } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('fakeEmailTheme') as 'dark' | 'light' | null;
    if (savedTheme === 'light') {
      setTheme('light');
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      setTheme('dark');
      document.documentElement.removeAttribute('data-theme');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('fakeEmailTheme', nextTheme);
    if (nextTheme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  return (
    <button 
      className="nav-btn-neon" 
      onClick={toggleTheme}
      title={mounted ? `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode` : 'Toggle Theme'}
      aria-label="Toggle Theme Mode"
    >
      <span className="nav-btn-neon-glow"></span>
      <span className="nav-btn-text">
        {mounted && theme === 'light' ? (
          <>
            <Moon size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-2px' }} />
            Dark Cloak
          </>
        ) : (
          <>
            <Zap size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-2px' }} />
            Pro Cloak
          </>
        )}
      </span>
    </button>
  );
}
