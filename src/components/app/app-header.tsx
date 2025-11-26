import Link from 'next/link';
import { Button } from '../ui/button';
import { Globe, Languages, Check, ChevronDown, Headset, Ear, PenSquare } from 'lucide-react';
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
import { useReadingMode } from './reading-mode-provider';
import { useRouter } from 'next/navigation';

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

const ReadingModeToggle = () => {
    const { isReadingMode, toggleReadingMode } = useReadingMode();
    const { triggerAnimation } = useAnimation();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        triggerAnimation({
            icon: Ear,
            onAnimationEnd: toggleReadingMode
        });
    }

    return (
        <Button 
            variant="ghost" 
            size="icon" 
            aria-label="Toggle Reading Mode"
            onClick={handleClick}
            className={cn(isReadingMode && 'bg-accent text-accent-foreground')}
        >
            <Ear className="h-6 w-6" />
        </Button>
    )
}

interface AppHeaderProps {
    isAdmin?: boolean;
    lang?: 'az' | 'en' | 'ru';
    setLang?: (lang: 'az' | 'en' | 'ru') => void;
}


const AppHeader = ({ isAdmin = false, lang, setLang }: AppHeaderProps) => {
  const router = useRouter();
  const { triggerAnimation } = useAnimation();

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      e.preventDefault();
      triggerAnimation({ icon: PenSquare });
      router.push(href);
  };
  
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
                <a href="/communication-aid" onClick={(e) => handleLinkClick(e, "/communication-aid")}>
                    <Button asChild variant="ghost" size="icon" aria-label="Communication Aid">
                         <PenSquare className="h-6 w-6" />
                    </Button>
                </a>
                <ReadingModeToggle />
                <ThemeToggle />
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default AppHeader;
