
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { summarizeTopic } from '@/ai/flows/summarize-topic';
import { TOPICS, QuranTopic } from '@/lib/quran-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export function ExploreTopicsPanel() {
  const [selectedTopic, setSelectedTopic] = useState<QuranTopic | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleTopicSelect = async (topic: QuranTopic) => {
    setSelectedTopic(topic);
    setIsLoading(true);
    setSummary(null);

    try {
      const result = await summarizeTopic({ topic: topic.name });
      setSummary(result.summary);
    } catch (error) {
      console.error("Error fetching topic summary:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to get a summary for "${topic.name}".`,
      });
      setSelectedTopic(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getImageForTopic = (topic: QuranTopic) => {
    return PlaceHolderImages.find(img => img.id === topic.imageId) || PlaceHolderImages[0];
  };

  return (
    <div className="flex h-full flex-col">
      <header className="border-b p-4">
        <h2 className="text-2xl font-bold font-headline">Explore Topics</h2>
        <p className="text-muted-foreground text-sm">Discover summaries of key themes in the Qur'an.</p>
      </header>
      <ScrollArea className="flex-1">
        <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {TOPICS.map((topic) => {
            const image = getImageForTopic(topic);
            return (
              <Card
                key={topic.name}
                onClick={() => handleTopicSelect(topic)}
                className="cursor-pointer hover:shadow-lg transition-shadow duration-300 overflow-hidden group"
              >
                <div className="relative h-40 w-full">
                   {image && <Image
                    src={image.imageUrl}
                    alt={topic.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    data-ai-hint={image.imageHint}
                  />}
                </div>
                <CardHeader>
                  <CardTitle className="font-headline text-xl">{topic.name}</CardTitle>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      <Dialog open={!!selectedTopic} onOpenChange={(isOpen) => !isOpen && setSelectedTopic(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">{selectedTopic?.name}</DialogTitle>
            <DialogDescription>
              An AI-generated summary based on the Qur'an.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] mt-4">
            <div className="p-1 pr-6">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {summary}
                </p>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
