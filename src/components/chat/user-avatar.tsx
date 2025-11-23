
import { User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export function UserAvatar({ className }: { className?: string }) {
  return (
    <Avatar className={cn("h-8 w-8", className)}>
      <AvatarFallback className="bg-accent text-accent-foreground">
        <User className="h-5 w-5" />
      </AvatarFallback>
    </Avatar>
  );
}
