
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { interpretVerse } from '@/ai/flows/interpret-verse';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

const verseSchema = z.object({
  surah: z.string().min(1, 'Surah is required.'),
  ayah: z.string().min(1, 'Ayah is required.'),
});

export function SearchVersePanel() {
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [verseQuery, setVerseQuery] = useState('');
  const { toast } = useToast();

  const form = useForm<z.infer<typeof verseSchema>>({
    resolver: zodResolver(verseSchema),
    defaultValues: { surah: '', ayah: '' },
  });

  const onSubmit = async (values: z.infer<typeof verseSchema>) => {
    setIsLoading(true);
    setInterpretation(null);
    const query = `Qur'an ${values.surah}:${values.ayah}`;
    setVerseQuery(query);

    try {
      const result = await interpretVerse({ verse: query });
      setInterpretation(result.interpretation);
    } catch (error) {
      console.error("Error fetching verse interpretation:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get an interpretation for the verse.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <header className="border-b p-4">
        <h2 className="text-2xl font-bold font-headline">Search & Interpret Verse</h2>
        <p className="text-muted-foreground text-sm">Enter a Surah and Ayah to get an AI-powered interpretation.</p>
      </header>
      <ScrollArea className="flex-1">
        <div className="p-4 md:p-6">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="font-headline">Find a Verse</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <FormField
                      control={form.control}
                      name="surah"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Surah (Chapter)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 2" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ayah"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Ayah (Verse)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 255" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                    {isLoading ? 'Interpreting...' : 'Fetch & Interpret'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {(isLoading || interpretation) && (
            <Card className="max-w-2xl mx-auto mt-6">
              <CardHeader>
                <CardTitle className="font-headline">Interpretation for {verseQuery}</CardTitle>
                <CardDescription>An AI-generated context and deeper understanding.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {interpretation}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
