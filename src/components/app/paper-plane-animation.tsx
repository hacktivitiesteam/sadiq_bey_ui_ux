'use client';

import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaperPlaneAnimationProps {
  isAnimating: boolean;
}

export default function PaperPlaneAnimation({ isAnimating }: PaperPlaneAnimationProps) {
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
      <Send className="h-24 w-24" />
    </div>
  );
}
