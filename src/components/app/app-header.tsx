import Link from 'next/link';
import { Button } from '../ui/button';
import { Globe, Languages, Check, ChevronDown, Headset, Ear, PenSquare, Moon, Sun, Laptop, Menu } from 'lucide-react';
import ContactUs from './contact-us';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
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
  currentLang: 'az' | 'en';
  setLang: (lang: 'az' | 'en') => void;
  translations: any;
}

const languages = [
    { code: 'az', name: 'AZ', flag: '🇦🇿' },
    { code: 'en', name: 'EN', flag: '🇬🇧' },
] as const;


const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ currentLang, setLang, translations }) => {
  const { triggerAnimation } = useAnimation();
  const selectedLanguage = languages.find(l => l.code === currentLang);

  const handleLanguageChange = (e: Event, langCode: 'az' | 'en') => {
      e.preventDefault();
      triggerAnimation({
          icon: Languages,
          onAnimationEnd: () => setLang(langCode)
      });
  }

  return (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
            <Languages className="mr-2 h-4 w-4" />
            <span>{translations.change_language}</span>
        </DropdownMenuSubTrigger>
        <DropdownMenuPortal>
            <DropdownMenuSubContent>
                {languages.map((lang) => (
                    <DropdownMenuItem key={lang.code} onSelect={(e) => handleLanguageChange(e, lang.code)}>
                        <span className={cn("flex w-full items-center justify-between", currentLang === lang.code && "font-bold")}>
                            <span>{lang.flag} {lang.name === 'AZ' ? 'Azərbaycanca' : 'English'}</span>
                            {currentLang === lang.code && <Check className="h-4 w-4" />}
                        </span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuSubContent>
        </DropdownMenuPortal>
    </DropdownMenuSub>
  );
};

const ReadingModeToggle = ({ translations }: { translations: any }) => {
    const { isReadingMode, toggleReadingMode } = useReadingMode();
    const { triggerAnimation } = useAnimation();

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        triggerAnimation({
            icon: Ear,
            onAnimationEnd: toggleReadingMode
        });
    }

    return (
        <DropdownMenuItem onSelect={handleClick} className={cn(isReadingMode && 'bg-accent')}>
             <Ear className="mr-2 h-4 w-4" />
             <span>{translations.reading_mode}</span>
        </DropdownMenuItem>
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
    <DropdownMenuSub>
        <DropdownMenuSubTrigger>
            <Sun className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
             <span>{translations.toggle_theme}</span>
        </DropdownMenuSubTrigger>
        <DropdownMenuPortal>
            <DropdownMenuSubContent>
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
            </DropdownMenuSubContent>
        </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}


interface AppHeaderProps {
    isAdmin?: boolean;
    lang?: 'az' | 'en';
    setLang?: (lang: 'az' | 'en') => void;
}

const AppHeader = ({ isAdmin = false, lang, setLang }: AppHeaderProps) => {
  const router = useRouter();
  const { triggerAnimation } = useAnimation();

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      e.preventDefault();
      triggerAnimation({ icon: PenSquare, onAnimationEnd: () => router.push(href) });
  };
  
    const t = (lang: 'az' | 'en' = 'az') => ({
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
                {/* Admin does not need a sub-menu for theme */}
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => useTheme().setTheme("light")}>
                        {translations.light}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => useTheme().setTheme("dark")}>
                        {translations.dark}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => useTheme().setTheme("system")}>
                        {translations.system}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
            </div>
          ) : (
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-5 w-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                     {lang && setLang && <LanguageSwitcher currentLang={lang} setLang={setLang} translations={translations} />}
                     {lang && <ContactUs lang={lang} translations={translations} />}
                     <DropdownMenuItem onSelect={() => router.push('/communication-aid')}>
                        <PenSquare className="mr-2 h-4 w-4" />
                        <span>{translations.communication_aid}</span>
                     </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <ReadingModeToggle translations={translations} />
                    <ThemeToggle translations={translations} />
                </DropdownMenuContent>
             </DropdownMenu>
          )}
        </nav>
      </div>
    </header>
  );
};

export default AppHeader;
