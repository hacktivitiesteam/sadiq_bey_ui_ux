'use client';

import { useState, useEffect } from 'react';
import AppHeader from '@/components/app/app-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchTours } from '@/lib/firebase-actions';
import { useFirestore } from '@/firebase';
import type { Tour } from '@/lib/definitions';
import { Trophy, Medal, Award, Flag, TrendingUp, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { az } from 'date-fns/locale';

type Lang = 'az' | 'en';

const translations = {
  az: {
    title: 'Reytinq Cədvəli',
    description: 'Ən çox məsafə qət edən alpinistlərin sıralaması.',
    rank: 'Sıra',
    climber: 'Alpinist',
    mountain: 'Dağ',
    distance: 'Məsafə (km)',
    date: 'Tarix',
    no_tours: 'Hələ heç bir tamamlanmış tur yoxdur.',
    loading: 'Yüklənir...',
  },
  en: {
    title: 'Scoreboard',
    description: 'Ranking of climbers who have covered the most distance.',
    rank: 'Rank',
    climber: 'Climber',
    mountain: 'Mountain',
    distance: 'Distance (km)',
    date: 'Date',
    no_tours: 'No completed tours yet.',
    loading: 'Loading...',
  },
};

const RankIcon = ({ rank }: { rank: number }) => {
  if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
  if (rank === 3) return <Award className="h-6 w-6 text-yellow-700" />;
  return <span className="font-bold text-lg">{rank}</span>;
};

export default function ScoreboardPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<Lang>('az');
  const firestore = useFirestore();
  const t = translations[lang];

  useEffect(() => {
    const savedLang = localStorage.getItem('app-lang') as Lang;
    if (savedLang) {
      setLang(savedLang);
    }
  }, []);

  useEffect(() => {
    if (!firestore) return;
    async function getTours() {
      setLoading(true);
      try {
        const tourData = await fetchTours(firestore);
        setTours(tourData);
      } catch (error) {
        console.error('Error fetching tours:', error);
      } finally {
        setLoading(false);
      }
    }
    getTours();
  }, [firestore]);

  const handleSetLang = (newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem('app-lang', newLang);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      );
    }

    if (tours.length === 0) {
      return (
        <div className="text-center py-20 text-muted-foreground">
          <p>{t.no_tours}</p>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px] text-center">{t.rank}</TableHead>
            <TableHead>{t.climber}</TableHead>
            <TableHead>{t.mountain}</TableHead>
            <TableHead className="text-right">{t.distance}</TableHead>
            <TableHead className="text-right">{t.date}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tours.map((tour, index) => (
            <TableRow key={tour.id}>
              <TableCell className="text-center">
                <RankIcon rank={index + 1} />
              </TableCell>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {tour.userName || `User ${tour.userId.substring(0, 6)}`}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Flag className="h-4 w-4 text-muted-foreground" />
                  {tour.mountainName}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  {tour.distance.toFixed(2)} km
                </div>
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {tour.endTime ? formatDistanceToNow(new Date(tour.endTime), { addSuffix: true, locale: lang === 'az' ? az : undefined }) : '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <>
      <AppHeader lang={lang} setLang={handleSetLang} />
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Trophy className="h-10 w-10 text-yellow-500" />
              <div>
                <CardTitle className="text-3xl">{t.title}</CardTitle>
                <CardDescription>{t.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {renderContent()}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
