import Link from 'next/link';
import { Button } from '../ui/button';
import { Globe, Languages, Check, ChevronDown, Headset, Ear, PenSquare, Moon, Sun, Laptop } from 'lucide-react';
import ContactUs from './contact-us';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from '@/lib/utils';
import { useAnimation } from '../app/animation-provider';
import React from 'react';
import { useReadingMode } from './reading-mode-provider';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';


interface LanguageSwitcherProps {
  currentLang: 'az' | 'en' | 'ru';
  setLang: (lang: 'az' | 'en' | 'ru') => void;
  translations: any;
}

const languages = [
    { code: 'az', name: 'AZ', flag: '🇦🇿' },
    { code: 'en', name: 'EN', flag: '🇬🇧' },
    { code: 'ru', name: 'RU', flag: '🇷🇺' },
] as const;


const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ currentLang, setLang, translations }) => {
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
     <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost">
                            {selectedLanguage && <span className="mr-2">{selectedLanguage.flag}</span>}
                            {selectedLanguage?.name}
                            <ChevronDown className="ml-1 h-4 w-4 opacity-70" />
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
            </TooltipTrigger>
            <TooltipContent>
                <p>{translations.change_language}</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
  );
};

const ReadingModeToggle = ({ translations }: { translations: any }) => {
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
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={handleClick}
                        className={cn(isReadingMode && 'bg-accent text-accent-foreground')}
                    >
                        <Ear className="h-5 w-5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{translations.reading_mode}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

function ThemeToggle({ translations }: { translations: any }) {
  const { setTheme } = useTheme();
  const { triggerAnimation } = useAnimation();

  const handleThemeChange = (newTheme: string) => {
    let Icon;
    
    if (newTheme === 'light') {
        Icon = Sun;
    } else if (newTheme === 'dark') {
        Icon = Moon;
    } else { // 'system'
        Icon = Laptop;
    }
    
    triggerAnimation({
        icon: Icon,
        onAnimationEnd: () => setTheme(newTheme)
    });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">{translations.toggle_theme}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleThemeChange('light')}>
                <Sun className="mr-2 h-4 w-4" />
                <span>{translations.light}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleThemeChange('dark')}>
                <Moon className="mr-2 h-4 w-4" />
                <span>{translations.dark}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleThemeChange('system')}>
                <Laptop className="mr-2 h-4 w-4" />
                <span>{translations.system}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent>
          <p>{translations.toggle_theme}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
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
      triggerAnimation({ icon: PenSquare, onAnimationEnd: () => router.push(href) });
  };
  
    const t = (lang: 'az' | 'en' | 'ru' = 'az') => ({
      az: {
        user_panel: 'İstifadəçi Paneli',
        change_language: 'Dili dəyişdir',
        contact_us: 'Bizimlə əlaqə',
        communication_aid: 'Ünsiyyət köməkçisi',
        reading_mode: 'Oxuma rejimi',
        toggle_theme: 'Tema seçimi',
        light: 'İşıqlı',
        dark: 'Tünd',
        system: 'Sistem',
      },
      en: {
        user_panel: 'User Panel',
        change_language: 'Change language',
        contact_us: 'Contact Us',
        communication_aid: 'Communication Aid',
        reading_mode: 'Reading Mode',
        toggle_theme: 'Toggle theme',
        light: 'Light',
        dark: 'Dark',
        system: 'System',
      },
      ru: {
        user_panel: 'Панель пользователя',
        change_language: 'Сменить язык',
        contact_us: 'Связаться с нами',
        communication_aid: 'Помощник по общению',
        reading_mode: 'Режим чтения',
        toggle_theme: 'Переключить тему',
        light: 'Светлая',
        dark: 'Темная',
        system: 'Системная',
      },
    }[lang]);
    
  const translations = t(lang);

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
                   <Button variant="ghost">{translations.user_panel}</Button>
                </Link>
                <ThemeToggle translations={translations} />
            </div>
          ) : (
            <div className='flex items-center gap-1'>
                {lang && setLang && <LanguageSwitcher currentLang={lang} setLang={setLang} translations={translations} />}
                {lang && <ContactUs lang={lang} translations={translations} />}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                       <Button asChild variant="ghost" size="icon">
                            <a href="/communication-aid" onClick={(e) => handleLinkClick(e, "/communication-aid")}>
                                 <PenSquare className="h-5 w-5" />
                            </a>
                        </Button>
                    </TooltipTrigger>
                     <TooltipContent>
                        <p>{translations.communication_aid}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <ReadingModeToggle translations={translations} />
                <ThemeToggle translations={translations} />
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default AppHeader;
