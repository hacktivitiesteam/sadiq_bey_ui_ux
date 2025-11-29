'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { DropdownMenuItem } from '../ui/dropdown-menu';

export function LogoutButton() {
  const { pending } = useFormStatus();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:bg-red-500/10 focus:text-red-500">
        <LogOut className="mr-2 h-4 w-4" />
        <span>Çıxış</span>
    </DropdownMenuItem>
  );
}
