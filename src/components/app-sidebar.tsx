
import type { ActiveView } from '@/app/page';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { QuranLogo } from '@/components/quran-logo';
import { MessageCircle, Compass, Search } from 'lucide-react';

interface AppSidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
}

export function AppSidebar({ activeView, setActiveView }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarHeader>
        <QuranLogo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setActiveView('chat')}
              isActive={activeView === 'chat'}
              tooltip={{ children: 'AI Chat' }}
            >
              <MessageCircle />
              <span className="truncate">AI Chat</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setActiveView('explore')}
              isActive={activeView === 'explore'}
              tooltip={{ children: 'Explore Topics' }}
            >
              <Compass />
              <span className="truncate">Explore Topics</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setActiveView('search')}
              isActive={activeView === 'search'}
              tooltip={{ children: 'Search Verse' }}
            >
              <Search />
              <span className="truncate">Search Verse</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
