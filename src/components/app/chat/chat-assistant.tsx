'use client';
import { useState } from 'react';
import { useChat } from 'ai/react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MessageSquare, X } from 'lucide-react';
import ChatInput from './chat-input';
import ChatMessage from './chat-message';

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="primary" size="icon" className="rounded-full w-14 h-14 shadow-lg">
            {isOpen ? <X /> : <MessageSquare />}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="end"
          className="w-[80vw] max-w-lg h-[60vh] p-0 flex flex-col"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="p-4 border-b">
            <h3 className="font-semibold text-lg">Turism Helper</h3>
            <p className="text-sm text-muted-foreground">Səyahətinizlə bağlı hər hansı bir sualınız var?</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m) => (
              <ChatMessage key={m.id} message={m} />
            ))}
             {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
              <ChatMessage message={{ id: 'loading', role: 'assistant', content: '...' }} isLoading={true} />
            )}
            {messages.length === 0 && (
                <div className="text-center text-sm text-muted-foreground pt-10">
                    Salam! Necə kömək edə bilərəm?
                </div>
            )}
          </div>
          <div className="p-4 border-t">
            <ChatInput
              input={input}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
