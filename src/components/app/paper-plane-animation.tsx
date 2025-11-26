'use client';

import { Send, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAnimation } from './animation-provider';

export default function PaperPlaneAnimation() {
  const { isAnimating } = useAnimation();
  
  if (!isAnimating) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed z-[100] text-primary transition-opacity duration-200',
        isAnimating ? 'opacity-100 animate-fly' : 'opacity-0'
      )}
    >
      <Globe className="h-24 w-24" />
    </div>
  );
}
