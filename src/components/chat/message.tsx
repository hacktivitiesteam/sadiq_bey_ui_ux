
import { cn } from '@/lib/utils';
import { BotAvatar } from './bot-avatar';
import { UserAvatar } from './user-avatar';
import { Skeleton } from '../ui/skeleton';

export interface MessageProps {
  role: 'user' | 'bot';
  content: string;
  isLoading?: boolean;
}

function TypingIndicator() {
    return (
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground" />
      </div>
    );
}

export function Message({ role, content, isLoading }: MessageProps) {
  const isBot = role === 'bot';

  return (
    <div
      className={cn('flex items-start gap-3', {
        'justify-end': !isBot,
      })}
    >
      {isBot && <BotAvatar />}
      <div
        className={cn(
          'max-w-[80%] rounded-lg p-3 text-sm shadow-sm',
          isBot
            ? 'bg-card text-card-foreground'
            : 'bg-primary text-primary-foreground'
        )}
      >
        {isLoading ? <TypingIndicator /> : <div className="prose prose-sm dark:prose-invert break-words" dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }} />}
      </div>
      {!isBot && <UserAvatar />}
    </div>
  );
}

export function MessageSkeleton() {
  return (
    <div className="flex items-start gap-3">
      <BotAvatar />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}
