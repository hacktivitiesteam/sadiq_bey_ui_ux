
'use client';

import { useState, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Utensils,
  Shield,
  Hospital,
  BedDouble,
  Droplet,
  PersonStanding,
  X,
  Trash2,
  Send
} from 'lucide-react';

import AppHeader from '@/components/app/app-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useReadingMode } from '@/components/app/reading-mode-provider';

type Lang = 'az' | 'en' | 'ru';

const t = (lang: Lang) => ({
  az: {
    title: 'Ünsiyyət Köməkçisi',
    description: 'Danışmaqda çətinlik çəkənlər üçün vizual ünsiyyət vasitələri.',
    whiteboardTab: 'Yazı Lövhəsi',
    whiteboardPlaceholder: 'Mesajınızı buraya yazın...',
    clear: 'Təmizlə',
    iconBoardTab: 'İkon Lövhəsi',
    iconBoardDescription: 'Ehtiyacınızı bildirmək üçün bir ikona klikləyin.',
    icons: {
      food: 'Yemək istəyirəm',
      police: 'Polisə ehtiyacım var',
      hospital: 'Tibb yardımına ehtiyacım var',
      hotel: 'Otellə bağlı kömək lazımdır',
      water: 'Su istəyirəm',
      restroom: 'Tualetə getməliyəm',
    },
  },
  en: {
    title: 'Communication Aid',
    description: 'Visual communication tools for those who have difficulty speaking.',
    whiteboardTab: 'Whiteboard',
    whiteboardPlaceholder: 'Write your message here...',
    clear: 'Clear',
    iconBoardTab: 'Icon Board',
    iconBoardDescription: 'Click an icon to communicate your need.',
    icons: {
      food: 'I want to eat',
      police: 'I need the police',
      hospital: 'I need medical help',
      hotel: 'I need help with a hotel',
      water: 'I want water',
      restroom: 'I need to go to the restroom',
    },
  },
  ru: {
    title: 'Помощник по общению',
    description: 'Визуальные средства общения для тех, кто испытывает трудности с речью.',
    whiteboardTab: 'Доска для письма',
    whiteboardPlaceholder: 'Напишите ваше сообщение здесь...',
    clear: 'Очистить',
    iconBoardTab: 'Доска с иконами',
    iconBoardDescription: 'Нажмите на иконку, чтобы сообщить о своей потребности.',
    icons: {
      food: 'Я хочу есть',
      police: 'Мне нужна полиция',
      hospital: 'Мне нужна медицинская помощь',
      hotel: 'Мне нужна помощь с отелем',
      water: 'Я хочу воды',
      restroom: 'Мне нужно в туалет',
    },
  },
});

type IconInfo = {
  id: keyof ReturnType<typeof t>['az']['icons'];
  icon: LucideIcon;
};

const ICONS: IconInfo[] = [
  { id: 'food', icon: Utensils },
  { id: 'police', icon: Shield },
  { id: 'hospital', icon: Hospital },
  { id: 'hotel', icon: BedDouble },
  { id: 'water', icon: Droplet },
  { id: 'restroom', icon: PersonStanding },
];

function IconDisplay({ icon, text, onClear }: { icon: LucideIcon; text: string; onClear: () => void }) {
  const Icon = icon;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg text-center p-8 relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4"
          onClick={onClear}
        >
          <X className="h-6 w-6" />
        </Button>
        <div className="flex flex-col items-center justify-center gap-6">
          <Icon className="h-32 w-32 text-primary" />
          <p className="text-3xl font-bold">{text}</p>
        </div>
      </Card>
    </div>
  );
}


export default function CommunicationAidPage() {
  const [lang, setLang] = useState<Lang>('az');
  const [whiteboardText, setWhiteboardText] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<IconInfo | null>(null);
  const { isReadingMode, speakText } = useReadingMode();

  useEffect(() => {
    const savedLang = localStorage.getItem('app-lang') as Lang | null;
    if (savedLang) {
      setLang(savedLang);
    }
  }, []);

  const handleSetLang = (newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem('app-lang', newLang);
  };
  
  const trans = t(lang);

  const handleSpeak = (text: string | undefined) => {
    if (text) speakText(text, lang === 'az' ? 'tr-TR' : `${lang}-${lang.toUpperCase()}`);
  }

  return (
    <>
      <AppHeader lang={lang} setLang={handleSetLang} />

      {selectedIcon && (
        <IconDisplay
          icon={selectedIcon.icon}
          text={trans.icons[selectedIcon.id]}
          onClear={() => setSelectedIcon(null)}
        />
      )}

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8" onClick={() => handleSpeak(`${trans.title}. ${trans.description}`)}>
          <h1 className={cn("text-4xl font-extrabold tracking-tight lg:text-5xl", isReadingMode && 'cursor-pointer')}>{trans.title}</h1>
          <p className={cn("mt-2 text-lg text-muted-foreground", isReadingMode && 'cursor-pointer')}>
            {trans.description}
          </p>
        </div>

        <Tabs defaultValue="whiteboard" className="w-full max-w-2xl mx-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="whiteboard">{trans.whiteboardTab}</TabsTrigger>
            <TabsTrigger value="icon-board">{trans.iconBoardTab}</TabsTrigger>
          </TabsList>
          <TabsContent value="whiteboard">
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="relative">
                  <Textarea
                    placeholder={trans.whiteboardPlaceholder}
                    value={whiteboardText}
                    onChange={(e) => setWhiteboardText(e.target.value)}
                    className="h-32 text-lg"
                    aria-label="Whiteboard input"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute bottom-2 right-2 text-muted-foreground"
                    onClick={() => setWhiteboardText('')}
                    aria-label="Clear whiteboard"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
                <div className="w-full h-64 flex items-center justify-center bg-muted rounded-lg p-4 overflow-auto">
                  <p
                    className="text-5xl font-bold text-center break-words"
                    style={{ fontSize: Math.max(20, 72 - whiteboardText.length / 2) + 'px' }}
                  >
                    {whiteboardText}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="icon-board">
            <Card>
              <CardContent className="p-4">
                <p className="text-center text-muted-foreground mb-6" onClick={() => handleSpeak(trans.iconBoardDescription)}>
                  {trans.iconBoardDescription}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {ICONS.map((iconInfo) => {
                    const text = trans.icons[iconInfo.id];
                    return (
                      <Card
                        key={iconInfo.id}
                        className="p-4 flex flex-col items-center justify-center gap-2 text-center cursor-pointer hover:bg-accent hover:-translate-y-1 transition-transform"
                        onClick={() => {
                          setSelectedIcon(iconInfo);
                          handleSpeak(text);
                        }}
                      >
                        <iconInfo.icon className="h-12 w-12 text-primary" />
                        <p className="font-semibold">{text}</p>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
