import Link from 'next/link';
import { Button } from '../ui/button';
import { Globe, Languages, Check, ChevronDown } from 'lucide-react';
import ContactUs from './contact-us';
import { ThemeToggle } from './theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from '@/lib/utils';
import { useAnimation } from '../app/animation-provider';
import React from 'react';

interface LanguageSwitcherProps {
  currentLang: 'az' | 'en' | 'ru';
  setLang: (lang: 'az' | 'en' | 'ru') => void;
}

const languages = [
    { code: 'az', name: 'AZ', flag: '🇦🇿' },
    { code: 'en', name: 'EN', flag: '🇬🇧' },
    { code: 'ru', name: 'RU', flag: '🇷🇺' },
] as const;


const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ currentLang, setLang }) => {
  const { triggerAnimation } = useAnimation();
  const selectedLanguage = languages.find(l => l.code === currentLang);

  const handleLanguageChange = (e: Event, langCode: 'az' | 'en' | 'ru') => {
      e.preventDefault();
      triggerAnimation({
          icon: Languages,
          onAnimationEnd: () => setLang(langCode)
      });
  }

  return (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost">
                {selectedLanguage && <span className="mr-2">{selectedLanguage.flag}</span>}
                {selectedLanguage?.name}
                <ChevronDown className="ml-1 h-4 w-4 opacity-70" />
                <span className="sr-only">Dili dəyişdir</span>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            {languages.map((lang) => (
            <DropdownMenuItem key={lang.code} onSelect={(e) => handleLanguageChange(e, lang.code)}>
                <span className={cn("flex w-full items-center justify-between", currentLang === lang.code && "font-bold")}>
                    <span>{lang.flag} {lang.name === 'AZ' ? 'Azərbaycanca' : lang.name === 'EN' ? 'English' : 'Русский'}</span>
                    {currentLang === lang.code && <Check className="h-4 w-4" />}
                </span>
            </DropdownMenuItem>
            ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface AppHeaderProps {
    isAdmin?: boolean;
    lang?: 'az' | 'en' | 'ru';
    setLang?: (lang: 'az' | 'en' | 'ru') => void;
}


const AppHeader = ({ isAdmin = false, lang, setLang }: AppHeaderProps) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href={isAdmin ? "/admin" : "/home"} className="flex items-center gap-2">
          <Globe className="h-8 w-8 text-primary" />
          <div>
            <span className="text-lg font-bold">Turism Helper</span>
            <p className="text-xs text-muted-foreground -mt-1">by Hacktivities</p>
          </div>
        </Link>
        <nav className="flex items-center gap-2">
          {isAdmin ? (
             <div className='flex items-center gap-1'>
                <Link href="/home" passHref>
                   <Button variant="ghost">İstifadəçi Paneli</Button>
                </Link>
                <ThemeToggle />
            </div>
          ) : (
            <div className='flex items-center gap-1'>
                {lang && setLang && <LanguageSwitcher currentLang={lang} setLang={setLang} />}
                {lang && <ContactUs lang={lang} />}
                <ThemeToggle />
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default AppHeader;
