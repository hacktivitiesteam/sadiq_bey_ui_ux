'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Mountain } from '@/lib/definitions';
import { createOrUpdateMountain } from '@/lib/firebase-actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { useEffect } from 'react';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Ad (AZ) ən azı 2 hərf olmalıdır.' }),
  name_en: z.string().optional(),
  name_ru: z.string().optional(),
  description: z.string().min(10, { message: 'Təsvir (AZ) ən azı 10 hərf olmalıdır.' }),
  description_en: z.string().optional(),
  description_ru: z.string().optional(),
  imageUrl: z.string().url({ message: 'Düzgün bir URL daxil edin.' }),
});

interface MountainFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onFormSubmit: () => void;
  country?: Mountain | null; // Changed from Country to Mountain
}

export default function MountainForm({ isOpen, onOpenChange, onFormSubmit, country: mountain }: MountainFormProps) { // Renamed country to mountain
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      name_en: '',
      name_ru: '',
      description: '',
      description_en: '',
      description_ru: '',
      imageUrl: '',
    },
  });

  const { toast } = useToast();
  const { isSubmitting } = form.formState;
  const firestore = useFirestore();

  useEffect(() => {
    if (mountain) {
      form.reset({
        name: mountain.name,
        name_en: mountain.name_en || '',
        name_ru: mountain.name_ru || '',
        description: mountain.description,
        description_en: mountain.description_en || '',
        description_ru: mountain.description_ru || '',
        imageUrl: mountain.imageUrl,
      });
    } else {
      form.reset({
        name: '',
        name_en: '',
        name_ru: '',
        description: '',
        description_en: '',
        description_ru: '',
        imageUrl: '',
      });
    }
  }, [mountain, form]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if(!firestore) return;
    try {
      await createOrUpdateMountain(firestore, values, mountain?.id);
      toast({
        title: 'Uğurlu Əməliyyat',
        description: `Dağ uğurla ${mountain ? 'yeniləndi' : 'yaradıldı'}.`,
      });
      onFormSubmit();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Xəta',
        description: 'Əməliyyat zamanı xəta baş verdi.',
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mountain ? 'Dağı Redaktə Et' : 'Yeni Dağ Əlavə Et'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dağ Adı (AZ)</FormLabel>
                  <FormControl>
                    <Input placeholder="Məsələn: Şahdağ" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dağ Adı (EN)</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g.: Shahdag" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="name_ru"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dağ Adı (RU)</FormLabel>
                  <FormControl>
                    <Input placeholder="Напр.: Шахдаг" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Təsvir (AZ)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Dağ haqqında qısa məlumat..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Təsvir (EN)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Brief information about the mountain..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="description_ru"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Təsvir (RU)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Краткая информация о горе..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Şəkil URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Ləğv et
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mountain ? 'Yenilə' : 'Əlavə Et'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
