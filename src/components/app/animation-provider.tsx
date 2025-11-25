'use client';

import type { LucideIcon } from 'lucide-react';
import React, { createContext, useContext, useState, ReactNode } from 'react';

type AnimationPayload = {
  icon: LucideIcon;
  onAnimationEnd?: () => void;
};

type AnimationContextType = {
  triggerAnimation: (payload: AnimationPayload) => void;
};

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

export const AnimationProvider = ({ children }: { children: ReactNode }) => {
  const [animation, setAnimation] = useState<AnimationPayload | null>(null);

  const triggerAnimation = (payload: AnimationPayload) => {
    setAnimation(payload);
    setTimeout(() => {
      payload.onAnimationEnd?.();
      setAnimation(null);
    }, 500); // Corresponds to the animation duration
  };

  return (
    <AnimationContext.Provider value={{ triggerAnimation }}>
      {children}
      {animation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
          <animation.icon className="animate-scale-and-fade h-24 w-24 text-primary" />
        </div>
      )}
    </AnimationContext.Provider>
  );
};

export const useAnimation = () => {
  const context = useContext(AnimationContext);
  if (context === undefined) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
};
