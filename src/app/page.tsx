
'use client';

import React, { useState } from 'react';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/app-sidebar';
import { ChatPanel } from '@/components/chat/chat-panel';
import { ExploreTopicsPanel } from '@/components/explore/explore-topics-panel';
import { SearchVersePanel } from '@/components/search/search-verse-panel';

export type ActiveView = 'chat' | 'explore' | 'search';

export default function QurAIHomepage() {
  const [activeView, setActiveView] = useState<ActiveView>('chat');

  const renderContent = () => {
    switch (activeView) {
      case 'chat':
        return <ChatPanel />;
      case 'explore':
        return <ExploreTopicsPanel />;
      case 'search':
        return <SearchVersePanel />;
      default:
        return <ChatPanel />;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar activeView={activeView} setActiveView={setActiveView} />
        <SidebarInset className="flex-1">
          <main className="h-full w-full">
            {renderContent()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
