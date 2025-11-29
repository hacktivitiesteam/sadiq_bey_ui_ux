'use client';

import { useState, useEffect, useRef } from 'react';
import AppHeader from '@/components/app/app-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchActiveTours } from '@/lib/firebase-actions';
import { useFirestore, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Tour } from '@/lib/definitions';
import { User, Flag, TrendingUp, RadioTower, Video, VideoOff } from 'lucide-react';

type Lang = 'az' | 'en';

const translations = {
  az: {
    title: 'Aktiv Turların İzlənməsi',
    description: 'Hazırda davam edən turlara canlı baxış.',
    no_active_tours: 'Hazırda aktiv tur yoxdur.',
    user: 'İstifadəçi',
    mountain: 'Dağ',
    distance: 'Məsafə',
    status: 'Status',
    camera_feed: 'Kamera Görüntüsü',
    waiting_for_stream: 'Yayım gözlənilir...',
    stream_not_available: 'Yayım mövcud deyil',
  },
  en: {
    title: 'Active Tour Monitoring',
    description: 'Live overview of ongoing tours.',
    no_active_tours: 'No active tours at the moment.',
    user: 'User',
    mountain: 'Mountain',
    distance: 'Distance',
    status: 'Status',
    camera_feed: 'Camera Feed',
    waiting_for_stream: 'Waiting for stream...',
    stream_not_available: 'Stream not available',
  },
};

function TourCard({ tour, lang }: { tour: Tour; lang: Lang }) {
  const t = translations[lang];
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // NOTE: This component would need a full WebRTC implementation to connect to the user's stream.
  // For this PoC, we will just show a placeholder.

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {tour.userName}
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Flag className="h-4 w-4" />
          {tour.mountainName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-semibold">{t.distance}</p>
              <p>{tour.distance.toFixed(2)} km</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <RadioTower className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-semibold">{t.status}</p>
              <p className="capitalize text-green-500">{tour.status}</p>
            </div>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-2">{t.camera_feed}</h4>
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
             <div className='text-center'>
                 <VideoOff className="h-12 w-12 mx-auto" />
                 <p className='mt-2'>{t.stream_not_available}</p>
             </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TourMonitorPage() {
  const [lang] = useState<Lang>('az'); // Admin page, default to 'az'
  const firestore = useFirestore();
  const { data: tours, isLoading } = useCollection<Tour>(firestore ? collection(firestore, 'tours') : null);
  const t = translations[lang];

  const activeTours = tours?.filter(t => t.status === 'active') || [];

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
        </div>
      );
    }

    if (activeTours.length === 0) {
      return (
        <div className="text-center py-20 bg-muted rounded-lg">
          <VideoOff className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-xl font-semibold">{t.no_active_tours}</h3>
        </div>
      );
    }

    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTours.map(tour => (
          <TourCard key={tour.id} tour={tour} lang={lang} />
        ))}
      </div>
    );
  };

  return (
    <>
      <AppHeader isAdmin={true} />
      <main className="p-4 md:p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{t.title}</h1>
          <p className="text-muted-foreground">{t.description}</p>
        </div>
        {renderContent()}
      </main>
    </>
  );
}
