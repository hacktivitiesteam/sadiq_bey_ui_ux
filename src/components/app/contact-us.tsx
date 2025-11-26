'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { addFeedback } from '@/lib/firebase-actions';
import { Loader2, Headset } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { useAnimation } from '../app/animation-provider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

type Lang = 'az' | 'en' | 'ru';

const translations = {
  az: {
    contact: 'Bizimlə Əlaqə',
    name: 'Ad',
    namePlaceholder: 'Adınız',
    surname: 'Soyad',
    surnamePlaceholder: 'Soyadınız',
    suggestions: 'Təklif və ya İradlarınız',
    messagePlaceholder: 'Mesajınız...',
    cancel: 'Ləğv et',
    send: 'Göndər',
    successTitle: 'Mesaj Göndərildi',
    successDescription: 'Rəyiniz üçün təşəkkür edirik!',
    errorTitle: 'Xəta',
    errorDescription: 'Xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.',
    validation: {
        name: 'Ad ən azı 2 hərf olmalıdır.',
        surname: 'Soyad ən azı 2 hərf olmalıdır.',
        email: 'Düzgün bir email daxil edin.',
        message: 'Mesaj ən azı 10 hərf olmalıdır.'
    }
  },
  en: {
    contact: 'Contact Us',
    name: 'Name',
    namePlaceholder: 'Your Name',
    surname: 'Surname',
    surnamePlaceholder: 'Your Surname',
    suggestions: 'Suggestions or Comments',
    messagePlaceholder: 'Your message...',
    cancel: 'Cancel',
    send: 'Send',
    successTitle: 'Message Sent',
    successDescription: 'Thank you for your feedback!',
    errorTitle: 'Error',
    errorDescription: 'An error occurred. Please try again.',
     validation: {
        name: 'Name must be at least 2 characters.',
        surname: 'Surname must be at least 2 characters.',
        email: 'Please enter a valid email.',
        message: 'Message must be at least 10 characters.'
    }
  },
  ru: {
    contact: 'Связаться с нами',
    name: 'Имя',
    namePlaceholder: 'Ваше имя',
    surname: 'Фамилия',
    surnamePlaceholder: 'Ваша фамилия',
    suggestions: 'Предложения или комментарии',
    messagePlaceholder: 'Ваше сообщение...',
    cancel: 'Отмена',
    send: 'Отправить',
    successTitle: 'Сообщение отправлено',
    successDescription: 'Спасибо за ваш отзыв!',
    errorTitle: 'Ошибка',
    errorDescription: 'Произошла ошибка. Пожалуйста, попробуйте еще раз.',
     validation: {
        name: 'Имя должно содержать не менее 2 букв.',
        surname: 'Фамилия должна содержать не менее 2 букв.',
        email: 'Пожалуйста, введите действительный email.',
        message: 'Сообщение должно содержать не менее 10 символов.'
    }
  },
}

const createFormSchema = (lang: Lang) => z.object({
  name: z.string().min(2, { message: translations[lang].validation.name }),
  surname: z.string().min(2, { message: translations[lang].validation.surname }),
  email: z.string().email({ message: translations[lang].validation.email }),
  message: z.string().min(10, { message: translations[lang].validation.message }),
});

interface ContactUsProps {
  lang: Lang;
  translations: any;
}

export default function ContactUs({ lang, translations }: ContactUsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = translations;
  const formSchema = createFormSchema(lang);
  const { triggerAnimation } = useAnimation();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      surname: '',
      email: '',
      message: '',
    },
  });

  const { toast } = useToast();
  const { isSubmitting } = form.formState;
  const firestore = useFirestore();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;

    try {
      await addFeedback(firestore, values);
      toast({
        title: t.successTitle,
        description: t.successDescription,
      });
      setIsOpen(false);
      form.reset();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t.errorTitle,
        description: t.errorDescription,
      });
    }
  }

  const handleTriggerClick = () => {
    triggerAnimation({ 
        icon: Headset, 
        onAnimationEnd: () => setIsOpen(true)
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" onClick={handleTriggerClick}>
                  <Headset className="h-5 w-5" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t.contact_us}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{t.contact_us}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{translations.name}</FormLabel>
                    <FormControl>
                      <Input placeholder={translations.namePlaceholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="surname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{translations.surname}</FormLabel>
                    <FormControl>
                      <Input placeholder={translations.surnamePlaceholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{translations.suggestions}</FormLabel>
                  <FormControl>
                    <Textarea rows={5} placeholder={translations.messagePlaceholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  {translations.cancel}
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {translations.send}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
