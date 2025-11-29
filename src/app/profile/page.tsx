'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { getUserProfile, updateUserProfile } from '@/lib/firebase-actions';
import { UserProfile, UserProfileSchema } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, User as UserIcon, Ticket, Gift } from 'lucide-react';
import AppHeader from '@/components/app/app-header';
import { Skeleton } from '@/components/ui/skeleton';

function ProfileForm() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);

    const form = useForm<UserProfile>({
        resolver: zodResolver(UserProfileSchema),
        defaultValues: {},
    });

    useEffect(() => {
        if (user && firestore) {
            setLoading(true);
            getUserProfile(firestore, user.uid).then(profile => {
                if (profile) {
                    form.reset(profile);
                } else {
                    // Pre-fill email if profile is new
                    form.reset({ email: user.email || undefined });
                }
                setLoading(false);
            });
        }
    }, [user, firestore, form]);
    
    async function onSubmit(values: UserProfile) {
        if (!user || !firestore) return;
        try {
            await updateUserProfile(firestore, user.uid, values);
            toast({ title: "Uğurlu!", description: "Profil məlumatlarınız yeniləndi." });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Xəta', description: error.message });
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        )
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                    <CardHeader><CardTitle>Əsas Məlumatlar</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Ad və Soyad</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" readOnly disabled {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField control={form.control} name="emergencyContactName" render={({ field }) => (
                                <FormItem><FormLabel>Təcili Əlaqə (Ad)</FormLabel><FormControl><Input {...field} value={field.value || ''}/></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="emergencyContactPhone" render={({ field }) => (
                                <FormItem><FormLabel>Təcili Əlaqə (Telefon)</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Demoqrafik Məlumatlar</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                             <FormField control={form.control} name="gender" render={({ field }) => (
                                <FormItem><FormLabel>Cins</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || ''}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Seçin" /></SelectTrigger></FormControl>
                                        <SelectContent><SelectItem value="Male">Kişi</SelectItem><SelectItem value="Female">Qadın</SelectItem><SelectItem value="Other">Digər</SelectItem></SelectContent>
                                    </Select>
                                <FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="age" render={({ field }) => (
                                <FormItem><FormLabel>Yaş</FormLabel><FormControl><Input type="number" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="family" render={({ field }) => (
                                <FormItem><FormLabel>Ailə</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value ? String(field.value) : ''}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Seçin" /></SelectTrigger></FormControl>
                                        <SelectContent><SelectItem value="0">Uşaq yoxdur</SelectItem><SelectItem value="1">Bir uşaq</SelectItem><SelectItem value="2">Birdən çox</SelectItem></SelectContent>
                                    </Select>
                                <FormMessage /></FormItem>
                            )} />
                        </div>
                    </CardContent>
                </Card>
                
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Yadda Saxla
                </Button>
            </form>
        </Form>
    );
}

function CouponsTab() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Kuponlarım</CardTitle>
                <CardDescription>Qazandığınız kuponlar burada göstəriləcək.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg">
                    <Gift className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold">Hələlik heç bir kupon qazanmamısınız.</h3>
                    <p className="text-muted-foreground mt-2">İlk yürüşünüzü tamamlayaraq kupon əldə edə bilərsiniz!</p>
                </div>
            </CardContent>
        </Card>
    );
}


export default function ProfilePage() {
    const searchParams = useSearchParams();
    const tab = searchParams.get('tab') || 'profile';
    const [lang, setLang] = useState<'az' | 'en'>('az');

    useEffect(() => {
        const savedLang = localStorage.getItem('app-lang') as 'az' | 'en' | null;
        if (savedLang) {
            setLang(savedLang);
        }
    }, []);

    return (
        <>
            <AppHeader lang={lang} setLang={setLang} />
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <Tabs defaultValue={tab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="profile">
                                <UserIcon className="mr-2 h-4 w-4" /> Profil
                            </TabsTrigger>
                            <TabsTrigger value="coupons">
                                <Ticket className="mr-2 h-4 w-4" /> Kuponlar
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="profile" className="mt-6">
                            <ProfileForm />
                        </TabsContent>
                        <TabsContent value="coupons" className="mt-6">
                            <CouponsTab />
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </>
    );
}
