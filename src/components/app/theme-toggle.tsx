'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAnimation } from '../app/animation-provider';

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const { triggerAnimation } = useAnimation();

  const handleThemeChange = (e: Event, newTheme: string) => {
    e.preventDefault();
    let Icon;
    
    if (newTheme === 'light') {
        Icon = Sun;
    } else if (newTheme === 'dark') {
        Icon = Moon;
    } else { // 'system'
        const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        Icon = isSystemDark ? Moon : Sun;
    }
    
    triggerAnimation({
        icon: Icon,
        onAnimationEnd: () => setTheme(newTheme)
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={(e) => handleThemeChange(e, 'light')}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={(e) => handleThemeChange(e, 'dark')}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={(e) => handleThemeChange(e, 'system')}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
