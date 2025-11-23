
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { answerQueryWithQuran } from '@/ai/flows/answer-query-with-quran';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Message, type MessageProps } from './message';
import { SendHorizonal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const chatSchema = z.object({
  prompt: z.string().min(1, 'Message cannot be empty.'),
});

const initialMessage: MessageProps = {
  role: 'bot',
  content: "Assalamu alaikum! I am QurAI, your assistant for exploring the Qur'an. How may I help you today?",
};

export function ChatPanel() {
  const [messages, setMessages] = useState<MessageProps[]>([initialMessage]);
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof chatSchema>>({
    resolver: zodResolver(chatSchema),
    defaultValues: { prompt: '' },
  });

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const onSubmit = async (values: z.infer<typeof chatSchema>) => {
    const userMessage: MessageProps = { role: 'user', content: values.prompt };
    const botMessage: MessageProps = { role: 'bot', content: '', isLoading: true };

    setMessages((prev) => [...prev, userMessage, botMessage]);
    form.reset();
    setIsStreaming(true);

    try {
      const { answer } = await answerQueryWithQuran({ query: values.prompt });
      setMessages((prev) =>
        prev.map((msg, i) =>
          i === prev.length - 1 ? { ...msg, content: answer, isLoading: false } : msg
        )
      );
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setMessages((prev) =>
        prev.map((msg, i) =>
          i === prev.length - 1 ? { ...msg, content: "Sorry, I encountered an error. Please try again.", isLoading: false } : msg
        )
      );
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get a response from the AI.",
      });
    } finally {
      setIsStreaming(false);
    }
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        if (!isStreaming) {
          form.handleSubmit(onSubmit)();
        }
    }
  };

  return (
    <div className="flex h-full flex-col">
      <header className="border-b p-4">
        <h2 className="text-2xl font-bold font-headline">AI Chat</h2>
        <p className="text-muted-foreground text-sm">Ask questions and get insights from the Qur'an.</p>
      </header>
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-4 space-y-6">
            {messages.map((msg, index) => (
              <Message key={index} {...msg} />
            ))}
          </div>
        </ScrollArea>
      </div>
      <div className="border-t p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-2">
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Textarea
                      placeholder="Ask a question about the Qur'an..."
                      className="resize-none"
                      rows={1}
                      {...field}
                      onKeyDown={handleKeyDown}
                      disabled={isStreaming}
                    />

                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" size="icon" disabled={isStreaming} className="h-auto aspect-square">
              <SendHorizonal />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
